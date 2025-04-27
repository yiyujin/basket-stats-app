import { TOKEN, DATABASE_ID_PLAYERS, DATABASE_ID_TEAMS, DATABASE_ID_VIDEOS, DATABASE_ID_GAMES, DATABASE_ID_SPORTS, DATABASE_ID_POSITIONS, DATABASE_ID_HIGHLIGHTS, PAGE_ID_ABOUT, PAGE_ID_RELEASE } from './config/index.js';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } from './config/index.js';

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import AWS from "aws-sdk";
import multer from "multer";
import { Client } from "@notionhq/client";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SERVER INITIALIZES
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);
app.use(express.json());

let conductorId = null;
let connectedUsers = [];
let highlights = [];

let videoState = {
  isPlaying: false,
  currentTime: 0,
  lastUpdated: Date.now()
};

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  if (!conductorId) {
    conductorId = socket.id;
    io.emit("conductorAssigned", conductorId);
  }

  connectedUsers.push({ id: socket.id, name: "" });
  io.emit("userUpdates", connectedUsers);

  socket.emit("highlightUpdates", highlights);

  socket.emit("initialSync", videoState);
  
  if (conductorId && socket.id !== conductorId) {
    io.to(conductorId).emit("newViewerJoined", { 
      viewerId: socket.id,
      timestamp: Date.now() 
    });
  }

  socket.on("setUsername", ( { id, name } ) => {
    connectedUsers = connectedUsers.map(user =>
      user.id === id ? { ...user, name } : user
    );
    io.emit("userUpdates", connectedUsers);
  });

  socket.on("playVideo", (timestamp) => {
    if (socket.id === conductorId) {
      videoState = { isPlaying: true, currentTime: timestamp, lastUpdated: Date.now() };
      socket.broadcast.emit("syncPlay", timestamp);
    }
  });

  socket.on("pauseVideo", (timestamp) => {
    if (socket.id === conductorId) {
      videoState = { isPlaying: false, currentTime: timestamp, lastUpdated: Date.now() };
      socket.broadcast.emit("syncPause", timestamp);
    }
  });  

  socket.on("seekVideo", (timestamp) => {
    if (socket.id === conductorId) {
      videoState.currentTime = timestamp;
      videoState.lastUpdated = Date.now();
      socket.broadcast.emit("syncSeek", timestamp);
    }
  });
  
  socket.on("updateVideoState", (state) => {
    if (socket.id === conductorId) {
      videoState = { ...state, lastUpdated: Date.now() };
    }
  });

  socket.on("addHighlight", (highlight) => {
    highlights.push(highlight);
    io.emit("highlightUpdates", highlights);
  });

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter((user) => user.id !== socket.id);
    io.emit("userUpdates", connectedUsers);

    if (socket.id === conductorId) {
      conductorId = connectedUsers.length ? connectedUsers[0].id : null;
      io.emit("conductorAssigned", conductorId);
    }

    console.log(`Client disconnected: ${socket.id}`);
  });
});

// *** S3 API ***
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
});

// UPLOAD VIDEO
app.post("/upload-video", upload.single('video'), async (req, res) => {
  console.log("Upload request received");
  
  if (!req.file) {
    console.log("No file received in request");
    return res.status(400).json({ error: "No video file provided" });
  }

  console.log(`File received: ${req.file.originalname}, size: ${req.file.size}, mimetype: ${req.file.mimetype}`);
  
  const fileName = `video-${Date.now()}.webm`;
  
  try {
    console.log(`Uploading to S3 bucket: ${AWS_BUCKET_NAME}, key: ${fileName}`);
    
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const uploadResult = await s3.upload(params).promise();
    console.log("S3 upload successful:", uploadResult.Location);
    
    const presignedUrl = s3.getSignedUrl('getObject', {
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
      Expires: 3600,
    });
    
    console.log("Generated presigned URL:", presignedUrl);
    
    res.json({ 
      success: true,
      fileUrl: presignedUrl,
      fileKey: fileName,
      originalUrl: uploadResult.Location
    });
  } catch (error) {
    console.error("S3 upload error:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Failed to upload video", 
      details: error.message
    });
  }
});

// GET VIDEO - S3
app.get("/get-video-url/:fileKey", async (req, res) => {
  console.log(req.params.fileKey);
  try {
    const fileKey = req.params.fileKey;
    
    console.log(fileKey);
    // Check if file exists first
    try {
      await s3.headObject({
        Bucket: AWS_BUCKET_NAME,
        Key: fileKey
      }).promise();
    } catch (error) {
      return res.status(404).json({
        error: "File not found",
        details: error.message
      });
    }
    
    // Generate a presigned URL
    const presignedUrl = s3.getSignedUrl('getObject', {
      Bucket: AWS_BUCKET_NAME,
      Key: fileKey,
      Expires: 3600  // URL will be valid for 1 hour
    });
    
    res.json({
      success: true,
      fileUrl: presignedUrl
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate video URL",
      details: error.message
    });
  }
});

// app.get("/get-video-url", async (req, res) => {
//   try {
//     const fileKey = AWS_ACCESS_KEY_ID;

//     if (!fileKey) {
//       return res.status(400).json({ error: "Missing fileKey" });
//     }

//     const presignedUrl = s3.getSignedUrl("getObject", {
//       Bucket: AWS_BUCKET_NAME,
//       Key: fileKey,
//       Expires: 3600,
//     });

//     res.json({ fileUrl: presignedUrl });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to generate video URL", details: error.message });
//   }
// });

//TEST CONNECTION
app.get("/test", (req, res) => {
  res.json({ message: "Server is running correctly" });
});

//TEST ACCESS
app.get("/check-bucket", async (req, res) => {
  try {
    await s3.headBucket({ Bucket: AWS_BUCKET_NAME }).promise();
    
    res.json({ 
      success: true, 
      message: "Bucket is accessible",
      bucket: AWS_BUCKET_NAME,
      region : AWS_REGION,
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Bucket access check failed", 
      message: error.message,
      code: error.code,
      bucket: AWS_BUCKET_NAME,
      region : AWS_REGION,
    });
  }
});

// *** NOTION API ***
// QUERY A DATABASE
// get teams
export async function queryADatabaseTeams() {
  const notion = new Client({ auth: TOKEN });

  const response = await notion.databases.query({
    database_id: DATABASE_ID_TEAMS,
    filter: {
      and: [
        {
          property: "Status",
          select: {
            equals: "Active",
          },
        },
      ],
    },
    sorts: [
      {
        property: "Created",
        direction: "descending",
      },
    ],
  });
  
  return response.results;
}

app.post("/api/query-a-database-teams", async (req, res) => {
  try {
    const results = await queryADatabaseTeams();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get players - filter by team
export async function queryADatabasePlayers( id ) {
  const notion = new Client({ auth: TOKEN });

  const response = await notion.databases.query({
    database_id: DATABASE_ID_PLAYERS,
    filter: {
      and: [
        {
          property: "Status",
          select: {
            equals: "Active",
          },
        },
        {
          property: "Teams",
          relation: {
            contains: id
          }
        }
      ],
    },
    sorts: [
      {
        property: "order",
        direction: "ascending",
      },
    ],
  });

  return response.results;
}

app.post("/api/query-a-database-players", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required 'id' field" });
    }

    const results = await queryADatabasePlayers(id);
    res.json(results);
  } catch (error) {
    console.error("Error querying Notion database:", error);
    res.status(500).json({ error: error.message });
  }
});

// get games - filter by team
export async function queryADatabaseGames( id ) {
  const notion = new Client({ auth: TOKEN });

  const response = await notion.databases.query({
    database_id: DATABASE_ID_GAMES,
    filter: {
      and: [
        {
          property: "status",
          select: {
            equals: "Active",
          },
        },
        {
          property: "team",
          relation: {
            contains: id
          }
        },
      ],
    },

    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  return response.results;
}

app.post("/api/query-a-database-games", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required 'id' field" });
    }


    const results = await queryADatabaseGames(id);
    res.json(results);
  } catch (error) {
    console.error("Error querying Notion database:", error);
    res.status(500).json({ error: error.message });
  }
});

// get log and video - filter by secific game id
export async function queryADatabaseGamesForProcessing( id ) {
  const notion = new Client({ auth: TOKEN });

  const response = await notion.databases.query({
    database_id: DATABASE_ID_GAMES,
    filter: {
      and: [
        {
          property: "status",
          select: {
            equals: "Active",
          },
        },
        {
          property: "team",
          relation: {
            contains: id
          }
        }
      ],
    },
    
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  return response.results;
}

app.post("/api/query-a-database-games-for-processing", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required 'id' field" });
    }


    const results = await queryADatabaseGames(id);
    res.json(results);
  } catch (error) {
    console.error("Error querying Notion database:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET HIGHLIGHTS - FITLER BY GAME
export async function queryADatabaseHighlights( id ) {
  const notion = new Client({ auth: TOKEN });

  const response = await notion.databases.query({
    database_id: DATABASE_ID_HIGHLIGHTS,
    filter: {
      and: [
        // {
        //   property: "status",
        //   select: {
        //     equals: "Active",
        //   },
        // },
        {
          property: "game_id",
          rich_text : {
            equals : id
          }
        },
      ],
    },

    sorts: [
      {
        property: "Created",
        direction: "descending",
      },
    ],
  });

  return response.results;
}

app.post("/api/query-a-database-highlights", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required 'id' field" });
    }

    const results = await queryADatabaseHighlights(id);
    res.json(results);
  } catch (error) {
    console.error("Error querying Notion database:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET HIGHLIGHTS - FITLER BY PLAYER
export async function queryADatabaseHighlightsPlayer( id ) {
  const notion = new Client({ auth: TOKEN });

  const response = await notion.databases.query({
    database_id: DATABASE_ID_HIGHLIGHTS,
    filter: {
      and: [
        // {
        //   property: "status",
        //   select: {
        //     equals: "Active",
        //   },
        // },
        {
          property: "player_id",
          rich_text : {
            equals : id
          }
        },
      ],
    },

    sorts: [
      {
        property: "Created",
        direction: "descending",
      },
    ],
  });

  return response.results;
}

app.post("/api/query-a-database-highlights-player", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing required 'id' field" });
    }

    const results = await queryADatabaseHighlightsPlayer(id);
    res.json(results);
  } catch (error) {
    console.error("Error querying Notion database:", error);
    res.status(500).json({ error: error.message });
  }
});


//RETRIEVE A PAGE
// get a team
export async function retrieveAPageTeam( id ) {
  const notion = new Client({ auth: TOKEN });
  const response = await notion.pages.retrieve( { page_id: id } );
  return response;
}

app.get("/api/retrieve-a-page-team", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id parameter is required' });
  }

  try {
    const results = await retrieveAPageTeam( id );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get a player
export async function retrieveAPagePlayer( id ) {
  const notion = new Client({ auth: TOKEN });
  const response = await notion.pages.retrieve( { page_id: id } );
  return response;
}

app.get("/api/retrieve-a-page-player", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id parameter is required' });
  }

  try {
    const results = await retrieveAPagePlayer( id );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get a game
export async function retrieveAPageGame( id ) {
  const notion = new Client({ auth: TOKEN });
  const response = await notion.pages.retrieve( { page_id: id } );
  return response;
}

app.get("/api/retrieve-a-page-game", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id parameter is required' });
  }

  try {
    const results = await retrieveAPagePlayer( id );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE PAGE
// https://developers.notion.com/reference/post-page
export async function createAPage( name, url ) {
  const notion = new Client({ auth: TOKEN });

  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: DATABASE_ID_VIDEOS,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        url: {
          rich_text: [
            {
              text: {
                content: url,
              },
            },
          ],
        },
      },
    });

    // console.log("Page created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating page in Notion:", error.message);
    throw error;
  }
}

app.post("/api/create-a-page", async (req, res) => {
  const { name, url } = req.body; // Extract name and url from the request body.

  try {
    const result = await createAPage(name, url); // Call the createAPage function.
    res.status(200).json(result); // Send the response back to the client.
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors and send a proper response.
  }
});

// CREATE A PAGE - GAMES
export async function createAPageGames( name, url, log ) {
  const notion = new Client({ auth: TOKEN });

  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: DATABASE_ID_GAMES,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        url: {
          rich_text: [
            {
              text: {
                content: url,
              },
            },
          ],
        },
        log: {
          rich_text: [
            {
              text: {
                content: log,
              },
            },
          ],
        },
      },
    });

    // console.log("Page created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating page in Notion:", error.message);
    throw error;
  }
}

app.post("/api/create-a-page-games", async (req, res) => {
  const { name, url, log } = req.body; // Extract name and url from the request body.

  try {
    const result = await createAPageGames(name, url, log); // Call the createAPage function.
    res.status(200).json(result); // Send the response back to the client.
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors and send a proper response.
  }
});

// CREATE A PAGE - VIDEOS
export async function createAPageVideos( game_id, player_id, url ) {
  const notion = new Client({ auth: TOKEN });

  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: DATABASE_ID_VIDEOS,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "Highlight",
              },
            },
          ],
        },
        game_id: {
          rich_text: [
            {
              text: {
                content: game_id,
              },
            },
          ],
        },
        player_id: {
          rich_text: [
            {
              text: {
                content: player_id,
              },
            },
          ],
        },
        url: {
          rich_text: [
            {
              text: {
                content: url,
              },
            },
          ],
        },
      },
    });

    // console.log("create-a-page-videos", response);
    return response;
  } catch (error) {
    console.error("Error creating page in Notion:", error.message);
    throw error;
  }
}

app.post("/api/create-a-page-videos", async (req, res) => {
  const { game_id, player_id, url } = req.body; // Extract name and url from the request body.

  try {
    const result = await createAPageVideos(game_id, player_id, url); // Call the createAPage function.
    res.status(200).json(result); // Send the response back to the client.
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors and send a proper response.
  }
});

// CREATE A PAGE - HIGHLIGHTS
export async function createAPageHighlights( id, data ) {
  const notion = new Client({ auth: TOKEN });

  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: DATABASE_ID_HIGHLIGHTS,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "highlight",
              },
            },
          ],
        },
        game_id: {
          rich_text: [
            {
              text: {
                content: id,
              },
            },
          ],
        },
        time: {
          rich_text: [
            {
              text: {
                content: data.time,
              },
            },
          ],
        },
        time_in_seconds: {
          rich_text: [
            {
              text: {
                content: data.time_in_seconds,
              },
            },
          ],
        },
        created_by: {
          rich_text: [
            {
              text: {
                content: data.created_by,
              },
            },
          ],
        },
        comments: {
          rich_text: [
            {
              text: {
                content: data.comments,
              },
            },
          ],
        },
      },
    });

    // console.log("Page created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating page in Notion:", error.message);
    throw error;
  }
}

app.post("/api/create-a-page-highlights", async (req, res) => {
  const { id, data } = req.body; // Extract name and url from the request body.

  try {
    const result = await createAPageHighlights( id, data ); // Call the createAPage function.
    res.status(200).json(result); // Send the response back to the client.
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors and send a proper response.
  }
});

// UPDATE PAGE PROPERTIES
// https://developers.notion.com/reference/patch-page
export async function updatePageGames( pageId, url, log ) {
  const notion = new Client({ auth: TOKEN });

  try {
    const response = await notion.pages.update({
      page_id : pageId,
      properties: {
        url: {
          rich_text: [
            {
              text: {
                content: url,
              },
            },
          ],
        },
        log: {
          rich_text: [
            {
              text: {
                content: log,
              },
            },
          ],
        },
      },
    });

    return response;
  } catch (error) {
    console.error("Error creating page in Notion:", error.message);
    throw error;
  }
}

app.patch("/api/update-a-page-games", async (req, res) => {
  const { pageId, url, log } = req.body; // Extract name and url from the request body.

  try {
    const result = await updatePageGames(pageId, url, log); // Call the createAPage function.
    res.status(200).json(result); // Send the response back to the client.
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors and send a proper response.
  }
});


// UPDATE HIGHLIGHT COMMENTS JSON
export async function updatePageHighlights( pageId, comments ) {
  const notion = new Client({ auth: TOKEN });

  try {
    const response = await notion.pages.update({
      page_id : pageId,
      properties: {
        comments: {
          rich_text: [
            {
              text: {
                content: comments,
              },
            },
          ],
        },
      },
    });

    return response;
  } catch (error) {
    console.error("Error creating page in Notion:", error.message);
    throw error;
  }
}

app.patch("/api/update-a-page-highlights", async (req, res) => {
  const { pageId, comments } = req.body;

  try {
    const result = await updatePageHighlights(pageId, comments);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE HIGHLIGHT - TYPE, GOALER
export async function updatePageHighlightsType( pageId, type, goaler, player_id ) {
  const notion = new Client({ auth: TOKEN });

  try {
    const response = await notion.pages.update({
      page_id : pageId,
      properties: {
        type: {
          rich_text: [
            {
              text: {
                content: type,
              },
            },
          ],
        },
        goaler: {
          rich_text: [
            {
              text: {
                content: goaler,
              },
            },
          ],
        },
        player_id: {
          rich_text: [
            {
              text: {
                content: player_id,
              },
            },
          ],
        },
      },
    });

    return response;
  } catch (error) {
    console.error("Error creating page in Notion:", error.message);
    throw error;
  }
}

app.patch("/api/update-a-page-highlights-type", async (req, res) => {
  const { pageId, type, goaler, player_id } = req.body;

  try {
    const result = await updatePageHighlightsType(pageId, type, goaler, player_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RETRIEVE BLOCK CHILDREN
// https://developers.notion.com/reference/get-block-children
export async function retrieveBlockChildren(startCursor = null) {
  const notion = new Client({ auth: TOKEN });

  const params = {
    block_id: PAGE_ID_ABOUT,
    page_size: 100,
  };

  // Include start_cursor if provided
  if (startCursor) {
    params.start_cursor = startCursor;
  }

  const response = await notion.blocks.children.list(params);
  return response;
}

app.get("/api/retrieve-block-children", async (req, res) => {
  const { start_cursor } = req.query; // Capture 'id' and 'start_cursor' from query parameters

  try {
    const response = await retrieveBlockChildren(start_cursor); // Pass start_cursor to retrieveBlockChildren
    res.json(response); // Send the full response back to the client
  } catch (error) {
    console.error("Error in retrieve-block-children:", error); // Log the full error
    res.status(500).json({ error: error.message });
  }
});

export async function retrieveBlockChildrenRelease() {
  const notion = new Client({ auth: TOKEN });

  const params = {
    block_id: PAGE_ID_RELEASE,
    page_size: 100,
  };

  const response = await notion.blocks.children.list(params);
  return response;
}

app.get("/api/retrieve-block-children-release", async (req, res) => {
  try {
    const response = await retrieveBlockChildrenRelease(); // Pass start_cursor to retrieveBlockChildren
    res.json(response); // Send the full response back to the client
  } catch (error) {
    console.error("Error in retrieve-block-children:", error); // Log the full error
    res.status(500).json({ error: error.message });
  }
});




// RUN SERVER
const PORT = 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

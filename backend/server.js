import "dotenv/config";
import express from "express";
import AWS from "aws-sdk";
import cors from "cors";
import multer from "multer";
import { Client } from "@notionhq/client";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { createProxyMiddleware } from 'http-proxy-middleware';

import { TOKEN, DATABASE_ID_PLAYERS, DATABASE_ID_TEAMS, DATABASE_ID_VIDEOS, DATABASE_ID_GAMES, DATABASE_ID_SPORTS, DATABASE_ID_POSITIONS } from './config/index.js';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } from './config/index.js';

const app = express();
app.use(express.json());
app.use(express.static('html'));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

const PORT = 8000; //8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
import "dotenv/config";
import express from "express";
import AWS from "aws-sdk";
import cors from "cors";
import multer from "multer";

import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } from './config/index.js';

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
  })
);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

// Setup multer for file uploads
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


// GET VIDEO
app.get("/get-video-url/:fileKey", async (req, res) => {
  try {
    const fileKey = req.params.fileKey;
    
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

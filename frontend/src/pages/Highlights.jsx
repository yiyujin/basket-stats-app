import { useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";

export default function Highlights() {
  const [status, setStatus] = useState("Initializing...");

  const id = "1a8afaf7b68480fb8974d793893035c8"; // game with sample.mp4
  const [highlightData, setHighlightData] = useState("");
  const [url, setUrl] = useState("");

  const [ffmpeg, setFfmpeg] = useState(null);
  const [clips, setClips] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState([]);

  // FETCH DB DATA
  const fetchData = async ( id ) => {
    try {
      const response = await fetch(`http://localhost:8000/api/retrieve-a-page-game?id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const result = await response.json();
      console.log("fetched log", JSON.parse(result.properties.log.rich_text[0].plain_text));

      setHighlightData(JSON.parse(result.properties.log.rich_text[0].plain_text));
      setUrl(result.properties.url.rich_text[0].plain_text);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
    
  useEffect(() => {
    fetchData(id);
  }, []);

  // GET S3 PRESIGNED URL
  const [videoUrl, setVideoUrl] = useState(null);

  const getVideo = async () => {
    try {
      const fileKey = url.split("?")[0].split("/").pop();

      const response = await fetch(`http://localhost:8000/get-video-url/${fileKey}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      console.log("fetched presigned URL:", data.fileUrl);
      setVideoUrl(data.fileUrl);
    } catch (error) {
      console.error("Error fetching video URL:", error);
    }
  };

  useEffect( () => {
    getVideo();
  }, [url]);

  useEffect(() => {
    async function loadResources() {
      try {
        // Step 2: Initialize FFmpeg
        setStatus("Loading FFmpeg...");
        const ffmpegInstance = new FFmpeg();
        await ffmpegInstance.load();
        setFfmpeg(ffmpegInstance);
        
        // Step 3: Load the video
        setStatus("Loading video...");
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
          throw new Error("Failed to fetch video data");
        }
        const videoData = await videoResponse.arrayBuffer();
        const videoUint8Array = new Uint8Array(videoData);
        
        // Log the size before writing
        console.log('Video data size before writing:', videoUint8Array.byteLength);
        
        // Step 4: Write to FFmpeg FS with error handling
        setStatus("Writing video to FFmpeg...");

        try {
          await ffmpegInstance.writeFile('sample.mp4', videoUint8Array); // 비디오 명 : 임의 이름
          
          // Verify the file exists after writing
          const filesAfterWrite = await ffmpegInstance.listDir('/');
          console.log('Files after write:', filesAfterWrite);
          
          // Don't check size, just check if file exists
          const sampleFile = filesAfterWrite.find(file => file.name === 'sample.mp4');
          
          if ( sampleFile ) {
            console.log('File found with size:', sampleFile.size);
            setStatus("Ready to process highlights!");

            setFfmpeg(ffmpegInstance);
          } else {
            throw new Error("File not found after writing");
          }
        } catch (writeError) {
          console.error("Error writing file:", writeError);
          throw new Error(`Failed to write video file: ${writeError.message}`);
        }
        
      } catch (error) {
        console.error("Error loading resources:", error);
        setStatus(`Error: ${error.message}`);
      }
    }

    loadResources();
  }, [videoUrl]);

  async function processHighlights(ffmpegInstance, highlights) {
    const processedClips = [];
    
    try {
      for (let i = 0; i < highlights.length; i++) {
        const highlight = highlights[i];
        setStatus(`Processing clip ${i + 1} of ${highlights.length} (${highlight.name}'s ${highlight.point}pt play)`);
        
        const clipFilename = `clip_${i}.mp4`;
        
        // Process the clip
        await ffmpegInstance.exec([
          '-ss', highlight.from,
          '-i', 'sample.mp4',
          '-t', '10',
          '-c', 'copy',
          clipFilename
        ]);
        
        // Read the processed file
        const data = await ffmpegInstance.readFile(clipFilename);
        const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
        const videoURL = URL.createObjectURL(videoBlob);
        
        // Add to processed clips
        processedClips.push({
          id: i,
          name: highlight.name,
          point: highlight.point,
          timestamp: highlight.timestamp,
          url: videoURL
        });
        
        // Clean up this clip's file
        await ffmpegInstance.deleteFile(clipFilename);
      }
      
      // Clean up the original video file
      await ffmpegInstance.deleteFile('sample.mp4');
      
      console.log(processedClips);
      setClips(processedClips);
      setStatus('All clips processed successfully!');
    } catch (error) {
      console.error('Error processing videos:', error);
      setStatus(`Error processing videos: ${error.message}`);
    }
  }

  async function uploadClipToS3(clip, index) {
    try {
      // Update upload status for this clip
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = "Uploading...";
        return newStatus;
      });
      
      // Convert Blob URL to actual Blob
      const response = await fetch(clip.url);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('video', blob, `clip_${clip.id}.mp4`);
      formData.append('metadata', JSON.stringify({
        name: clip.name,
        point: clip.point,
        timestamp: clip.timestamp
      }));
      
      // Upload to your existing endpoint
      const uploadResponse = await fetch('http://localhost:8000/upload-video', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload clip');
      }
      
      const result = await uploadResponse.json();
      
      // Update clip with S3 URL
      setClips(prevClips => {
        const newClips = [...prevClips];
        newClips[index] = {
          ...newClips[index],
          s3Url: result.fileUrl,
          uploaded: true
        };
        return newClips;
      });
      
      // Update upload status
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = "Uploaded";
        return newStatus;
      });
      
      return result;
    } catch (error) {
      console.error(`Error uploading clip ${index}:`, error);
      
      // Update upload status with error
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = `Error: ${error.message}`;
        return newStatus;
      });
      
      throw error;
    }
  }

  async function handleUploadClips() {
    setUploading(true);
    setStatus("Starting to upload clips...");
    
    // Initialize upload status array
    setUploadStatus(clips.map(() => "Waiting..."));
    
    try {
      // Upload clips one by one
      for (let i = 0; i < clips.length; i++) {
        setStatus(`Uploading clip ${i + 1} of ${clips.length}...`);
        const uploadResult = await uploadClipToS3(clips[i], i);
        
        // After successful upload, post to DB
        if (uploadResult && uploadResult.fileUrl) {
          setStatus(`Posting clip ${i + 1} to database...`);
          // Use the clip's name as player_id for this example
          // You might want to extract the actual player_id from your data
          await postToVideos(id, clips[i].name, uploadResult.fileUrl);
          
          setUploadStatus(prev => {
            const newStatus = [...prev];
            newStatus[i] = "Uploaded & Saved to DB";
            return newStatus;
          });
        }
      }
      
      setStatus("All clips uploaded and saved to database successfully!");
    } catch (error) {
      console.error("Error in upload process:", error);
      setStatus(`Upload process encountered an error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  // POST TO DB - VIDEOS
  const postToVideos = async ( game_id, player_id, url ) => {
    try {
      const response = await fetch("http://localhost:8000/api/create-a-page-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id,
          player_id,
          url
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log("Posted to Videos with game_id, player_id, url");
    } catch (error) {
      console.error("Error posting url to DB:", error.message);
    }
  };

  return (
    <>
    <h1>Video Processor</h1>
      <div id="progress">{status}</div>
      
      <div className="button-container">
        <button 
          onClick={() => processHighlights(ffmpeg, highlightData?.highlights)} 
          disabled={!ffmpeg || !highlightData || clips.length > 0}
        >
          Process Highlights
        </button>
        
        <button 
          onClick={handleUploadClips} 
          disabled={clips.length === 0 || uploading}
        >
          Upload Clips to S3
        </button>

        <button onClick = { () => postToVideos("game_id", "player_id", "url")}>Post to Videos Test</button>

      </div>
      
      <div id="clips">
        {clips.map((clip, index) => (
          <div key={clip.id} className="clip-container">
            <p>
              {clip.name}'s {clip.point}pt play at {clip.timestamp}
              {uploadStatus[index] && (
                <span className="upload-status"> - {uploadStatus[index]}</span>
              )}
            </p>
            <video controls src={clip.url}></video>
            {clip.s3Url && (
              <div className="s3-info">
                <p>S3 URL: <a href={clip.s3Url} target="_blank" rel="noopener noreferrer">View on S3</a></p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
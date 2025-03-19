import { useState, useEffect, useRef } from "react";
import VideoProcessor from './components/VideoProcessor'
import { Link } from "react-router-dom";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function About() {

  const id = "1a8afaf7b68480fb8974d793893035c8";
  const [data, setData] = useState([]);

  const [log, setLog] = useState("");
  const [url, setUrl] = useState("");

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
      setData(result.properties);
      setLog(JSON.parse(result.properties.log.rich_text[0].plain_text));
      setUrl(result.properties.url.rich_text[0].plain_text);

      // console.log(JSON.parse(result.properties.log.rich_text[0].plain_text));
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
    
  useEffect(() => {
    fetchData(id);
  }, []);

  // GET S3 VIDEO
  const [videoUrl, setVideoUrl] = useState(null);

  const getVideo = async () => {
    try {
      const fileKey = url.split("?")[0].split("/").pop();
      // console.log("Fetching video for fileKey:", fileKey);

      // const fileKey = "sample.mp4";

      const response = await fetch(`http://localhost:8000/get-video-url/${fileKey}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      console.log("getVideo() says Got presigned URL:", data.fileUrl);
      setVideoUrl(data.fileUrl);
    } catch (error) {
      console.error("Error fetching video URL:", error);
    }
  };

  useEffect( () => {
    getVideo();
  }, [log, url]);

  // PROCESSING 
  const [status, setStatus] = useState("Initializing...");
  const [highlightData, setHighlightData] = useState(null);
  const [ffmpeg, setFfmpeg] = useState(null);
  const [clips, setClips] = useState([]);

  const loadResources = async ( log, videoUrl ) => {
    try {
      // GET LOG
      // setStatus("Loading log...");
      // setHighlightData(log);
      // // console.log("!!!!!!!",highlightData);

      setStatus("Loading game data...");
      const response = await fetch('/game.json');
      if (!response.ok) {
        throw new Error('Failed to load highlight data');
      }
      const data = await response.json();
      setHighlightData(data);

      setStatus("Loading FFmpeg...");
      const ffmpegInstance = new FFmpeg();
      await ffmpegInstance.load();
      setFfmpeg(ffmpegInstance);

      // GET VIDEO
      // console.log(videoUrl);
      setStatus("Fetching video from S3...");
      const videoData = await fetchFile("https://basketstats-bucket.s3.amazonaws.com/sample.mp4?AWSAccessKeyId=AKIARYZYH7TEMCPFPGIX&Expires=1742324907&Signature=uW%2BPh%2B5MXRtafYa4A%2FH2QGF4dSg%3D");
      console.log("Video fetched from S3!");
    
      await ffmpegInstance.writeFile("input.mp4", videoData);
      console.log("Video written to FFmpeg virtual filesystem!");
    
      const testRead = await ffmpegInstance.readFile("input.mp4");
      console.log("FFmpeg virtual file exists! Size:", testRead.length);

      setStatus("Video ready for processing!");
    } catch (error) {
      console.error("Error loading resources:", error);
      setStatus(`Error: ${error.message}`);
    }
  }

  useEffect( () => {
    loadResources();
  }, [videoUrl]);

  async function processHighlights(ffmpegInstance, highlights) {
    if (!highlights || highlights.length === 0) {
      setStatus("No highlights to process");
      return;
    }

    const processedClips = [];

    try {
      for (let i = 0; i < highlights.length; i++) {
        const highlight = highlights[i];
        setStatus(`Processing clip ${i + 1} of ${highlights.length} (${highlight.name}'s ${highlight.point}pt play)`);

        const clipFilename = `clip_${i}.mp4`;

        // Process the clip
        await ffmpegInstance.exec([
          '-ss', highlight.from,
          '-i', 'input.mp4',
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
      await ffmpegInstance.deleteFile('input.mp4');

      setClips(processedClips);
      setStatus('All clips processed successfully!');

    } catch (error) {
      console.error('Error processing videos:', error);
      setStatus(`Error processing videos: ${error.message}`);
    }
  }

  return (
    <>
      <h1>Video Processor</h1>
      <div id="progress">{status}</div>

      <button onClick = { () => processHighlights(ffmpeg, highlightData?.highlights) } disabled={!ffmpeg || !highlightData?.highlights?.length}>
        Process Highlights
      </button>

      <div id="clips">
        {clips.map(clip => (
          <div key={clip.id} className="clip-container">
            <p>{clip.name}'s {clip.point}pt play at {clip.timestamp}</p>
            <video controls src={clip.url}></video>
          </div>
        ))}
      </div>

       {/* { videoUrl && (
        <video src = { videoUrl } type = "video/mp4" controls/>
      )} */}
    </>
  )
}
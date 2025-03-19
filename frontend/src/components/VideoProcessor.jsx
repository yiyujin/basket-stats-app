import { useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from '@ffmpeg/util';

export default function VideoProcessor() {
  const [status, setStatus] = useState("Initializing...");
  const [highlightData, setHighlightData] = useState(null);
  const [ffmpeg, setFfmpeg] = useState(null);
  const [clips, setClips] = useState([]);

  useEffect(() => {
    async function loadResources() {
      try {
        // Step 1: Fetch game.json
        setStatus("Loading game data...");
        const response = await fetch('/game.json');
        if (!response.ok) {
          throw new Error('Failed to load highlight data');
        }
        const data = await response.json();
        setHighlightData(data);
        
        // Step 2: Initialize FFmpeg
        setStatus("Loading FFmpeg...");
        const ffmpegInstance = new FFmpeg();
        await ffmpegInstance.load();
        setFfmpeg(ffmpegInstance);
        
        // Step 3: Load the video
        setStatus("Loading video...");
        const videoResponse = await fetch('/sample.mp4');
        const videoData = await videoResponse.arrayBuffer();
        
        // Step 4: Write the video to FFmpeg's virtual filesystem
        await ffmpegInstance.writeFile('sample.mp4', new Uint8Array(videoData));
        
        // Step 5: Process highlights
        setStatus("Press Button");
        // await processHighlights(ffmpegInstance, data.highlights);
        
      } catch (error) {
        console.error("Error loading resources:", error);
        setStatus(`Error: ${error.message}`);
      }
    }
    
    loadResources();
  }, []);

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
      <button 
  onClick={() => processHighlights(ffmpeg, highlightData?.highlights)} 
  disabled={!ffmpeg || !highlightData}
>
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
    </>
  );
}
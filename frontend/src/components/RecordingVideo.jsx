import { useState, useEffect, useRef } from "react";

export default function RecordingVideo(){
    const [recording, setRecording] = useState(false);
    const [duration, setDuration] = useState(0);

    const [videoURL, setVideoURL] = useState(null);
    const [blobData, setBlobData] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);

    const [fetchedVideoUrl, setFetchedVideoUrl] = useState(null);

    const streamRef = useRef(null);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const [timestamps, setTimestamps] = useState([]); // ✅ State for timestamps
    const [timestampData, setTimestampData] = useState(null); // ✅ JSON output state

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true,
                audio: true
              });

              streamRef.current = stream;

              if( videoRef.current ){
                videoRef.current.srcObject = stream;
              }

            const mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(1000);
            setRecording(true);
            setTimestamps([]); // reset
            setTimestampData(null); //reset

            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                setVideoURL(URL.createObjectURL(blob));
                setBlobData(blob);
                clearInterval(timerRef.current);
            };
        } catch (error) {
            console.log(`Camera access error : ${error.message}`);
        }
    }

    const endRecording = () => {
        if ( mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive" ) {
            mediaRecorderRef.current.stop();
            streamRef.current?.getTracks().forEach((track) => track.stop());

            setRecording(false);
            clearInterval(timerRef.current);
        }
    }

    const uploadRecording = async () => {
        if ( !blobData ) {
          console.log(`no blob data!`);
          return;
        }
    
        try {
          setUploading(true);

          const formData = new FormData();
          formData.append('video', blobData, 'recording.webm');
          
          console.log("Uploading file of size:", blobData.size);
        
          const response = await fetch("http://localhost:8000/upload-video", {
            method: "POST",
            body: formData,
          });
    
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || data.details || `Server error: ${response.status}`);
          }
    
          setUploadedVideoUrl(data.fileUrl);

          await postUrl("Name of Video", data.fileUrl);

          alert("Video uploaded successfully!");
        } catch (error) {
          console.error("Error during upload:", error);
          console.log(error.message);
        } finally {
          setUploading(false);
        }
    };

    const getVideo = async () => {
      if ( !uploadedVideoUrl ) {
        alert("No uploaded video URL yet. Upload first!");
        return;
      }
  
      try {
        const fileKey = uploadedVideoUrl.split("?")[0].split("/").pop();
        console.log("Fetching video for fileKey:", fileKey);
  
        const response = await fetch(`http://localhost:8000/get-video-url/${fileKey}`);
        
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || `Server error: ${response.status}`);
        }
  
        console.log("Got presigned URL:", data.fileUrl);
  
        setFetchedVideoUrl(data.fileUrl);
      } catch (error) {
        console.error("Error fetching video URL:", error);
      }
    };

    // POST Url to Database
    const postUrl = async ( name, url ) => {
      try {
        const response = await fetch("http://localhost:8000/api/create-a-page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
              name,
              url
          }),
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        console.log("Url is posted to DB successfully");
      } catch (error) {
        console.error("Error posting url to DB:", error.message);
      }
    };

    const logTimestamp = () => {
      if (recording) {
          setTimestamps((prev) => [...prev, duration]); // ✅ Use duration state
          console.log(`📍 Timestamp: ${duration}s`);
      }
  };

  const uploadTimestamp = () => {
    if (timestamps.length === 0) {
        console.warn("No timestamps to upload!");
        return;
    }

    const jsonData = {
        video_name: "Recording",
        duration: duration, // Total duration of recording
        timestamps: timestamps.map(time => ({ timestamp: time })) // Convert to JSON structure
    };

    setTimestampData(jsonData); // ✅ Save JSON to state
    console.log("jsonData:", jsonData);
};

    return(
        <div>
            <button onClick = { startRecording }>Start Recording</button>
            <button onClick = { endRecording } disabled = { !recording }>End Recording</button>
            <button onClick = { uploadRecording } disabled = { !videoURL || uploading }>{ uploading ? "Uploading..." : "Upload Video" }</button>
            <button onClick = { getVideo } disabled = {!uploadedVideoUrl}>Get Uploaded Video</button>

            <button onClick = { () => postUrl("Name test", "url test") }>Upload to DB Test</button>

            <button onClick={logTimestamp} disabled={!recording}>Log Timestamp</button>
            <button onClick={uploadTimestamp} disabled={timestamps.length === 0}>Upload Timestamp</button>

            { recording ? `${duration}s` : "" }

            <h3>Timestamps:</h3>
                {timestamps.map((time, index) => (
                    <p key={index}>⏱ {time}s</p>
                ))}

            { blobData ? `size : ${blobData.size}bytes` : "" }

            <div>
                {/* LIVE VIDEO */}
                <video className = "liveVideo" ref = { videoRef }  style = { { display: videoURL && !recording ? 'none' : 'block' } }  autoPlay playsInline muted width = "100%"/>

                {/* PLAYER VIDEO */}
                { videoURL && !recording &&  <video className = "playbackVideo" src = { videoURL } controls width = "100%"/> }

                {/* FETCHED VIDEO FROM SERVER */}
                { fetchedVideoUrl && <video className = "fetchedVideo" src = { fetchedVideoUrl } controls/> }
            </div>
        </div>
    )
}
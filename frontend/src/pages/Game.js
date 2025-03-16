import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import RecordingVideo from "../components/RecordingVideo";

export default function Game() {
    // ------ RECORDING ------
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
    
        const logTimestamp = (id, name) => {
            if (recording) {
                setTimestamps((prev) => [...prev, { id, timestamp: duration, name }]);
                console.log(`Timestamp recorded: ${id} - ${duration}s - ${name}`);
            }
        };        

    // -----------

    const location = useLocation();
    const { team = {}, players = [] } = location.state || {}; // Ensure safe defaults
    const teamName = team.properties?.Name?.title?.[0]?.plain_text || "Unknown Team";

    const [data, setData] = useState([]); // playing players buttons

    const handleCheckboxChange = (player) => {
        setData((prevData) => {
            if (prevData.some((p) => p.id === player.id)) {
                return prevData.filter((p) => p.id !== player.id);
            } else {
                return [...prevData, { id: player.id, name: player.name }];
            }
        });
    };

    return (
        <div style = { { display : "flex", flexDirection : "row", paddingTop : "64px", width : "100vw", height : "100vh" } }>
            <div style = { { width : "200px", minWidth: "200px", height : "100%", overflow : "scroll" } }>
                <p>Highlights ({ timestamps.length})</p>
                {timestamps.map((time, index) => (
                    <p key = { index } style = { { whiteSpace : "nowrap"} }>⏱ {time.timestamp} : {time.name} </p>
                ))}
            </div>            

        <div className="" style = { { flex : 1, width : "100%" } }>
            <h1>{teamName}</h1>
            <p>Start Recording Game for {teamName}</p>

            <button onClick = { startRecording }>Start Recording</button>
            <button onClick = { endRecording } disabled = { !recording }>End Recording</button>
            <button onClick = { uploadRecording } disabled = { !videoURL || uploading }>{ uploading ? "Uploading..." : "Upload Video to S3" }</button>
            <button onClick = { getVideo } disabled = {!uploadedVideoUrl}>Get Uploaded Video</button>
            <button onClick = { () => postUrl("Name test", "url test") }>POST url to Notion</button>
            <button onClick={logTimestamp} disabled={!recording}>TEST Log Timestamp</button>
            <button onClick = { () => console.log(timestamps) } disabled={timestamps.length === 0}>Console.log Timestamp</button>
            <button>POST json to Notion</button>

            <h1>{ `${duration}s` }</h1>

            { blobData ? `size : ${blobData.size}bytes` : "" }

            <div>
                {/* LIVE VIDEO */}
                <video className = "liveVideo" ref = { videoRef }  style = { { display: videoURL && !recording ? 'none' : 'block' } }  autoPlay playsInline muted width = "100%"/>

                {/* PLAYER VIDEO */}
                { videoURL && !recording &&  <video className = "playbackVideo" src = { videoURL } controls width = "100%"/> }

                {/* FETCHED VIDEO FROM SERVER */}
                { fetchedVideoUrl && <video className = "fetchedVideo" src = { fetchedVideoUrl } controls/> }
            </div>

            {/* <RecordingVideo /> */}

            <h2>Playing ({data.length})</h2>
            <p className="meta">Press Player for Highlight</p>

            <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
    {data.map((item, index) => (
        <button key={item.id || index} onClick={() => logTimestamp(item.id, item.name)}>
            {item.name}
        </button>
    ))}
</div>


            <hr/><br/><br/>

            <h2>Players ({players.length})</h2>
            <p className="meta">Select Players</p>

            {/* Players List */}
            <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                {players.map((item, index) => {
                    const playerName = item.properties?.Name?.title?.[0]?.plain_text || "Unnamed Player";
                    const firstName = item.properties?.first_name?.rich_text?.[0]?.plain_text || "";
                    const lastName = item.properties?.last_name?.rich_text?.[0]?.plain_text || "";
                    const backNumber = item.properties?.back_number?.rich_text?.[0]?.plain_text || "N/A";

                    return (
                        <div key={item.id || index} style={{ width: "100px", backgroundColor: "var(--black8)", padding: "8px" }}>
                            <div style={{
                                height: "80px",
                                border: "1px solid var(--black8)",
                                backgroundPosition: "center",
                                backgroundImage: "url(https://www.tottenhamhotspur.com/media/5y3crbxe/firstteam_profiles_mickyvandeven_202425_1.png?anchor=center&mode=crop&quality=90&width=500)",
                                backgroundSize: "cover"
                            }} />
                            <p className="number">{backNumber}</p>
                            <p>{playerName}</p>
                            <p className="meta" style={{ whiteSpace: "normal", wordWrap: "break-word", overflowWrap: "break-word" }}>
                                {firstName} {lastName}
                            </p>
                            <input
    type="checkbox"
    onChange={() =>
        handleCheckboxChange({
            id: item.id,
            name: item.properties?.Name?.title?.[0]?.plain_text || "Unknown",
        })
    }
    checked={data.some((p) => p.id === item.id)}
/>

                        </div>
                    );
                })}
            </div>
        </div>
        </div>
    );
}

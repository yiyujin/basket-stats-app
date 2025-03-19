import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import RecordingVideo from "../components/RecordingVideo";
import VideoProcessor from "../components/VideoProcessor";

export default function Game() {
  const location = useLocation();
  const { team = {}, players = [] } = location.state || {}; // Ensure safe defaults
  const teamName = team.properties?.Name?.title?.[0]?.plain_text || "Unknown Team";

  const [data, setData] = useState([]); // playing players buttons

  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");

  // ------ RECORDING ------
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const [videoURL, setVideoURL] = useState(null);
  const [blobData, setBlobData] = useState(null); // pass to VideoProcessor

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

  // PROCESS VIDEO STATES
  const [processedClips, setProcessedClips] = useState([]); // Stores processed video URLs
  const [processingVideo, setProcessingVideo] = useState(false);

  const videoProcessorRef = useRef(null);


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
              console.log("blobData : ", blob);
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

        // await postUrl("Name of Video", data.fileUrl);

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

  // POST TO GAMES
  const postToGames = async ( name, url, log ) => {
    try {
      const response = await fetch("http://localhost:8000/api/create-a-page-games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          url,
          log
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

  // UPDATE GAMES
  const updateGames = async ( pageId, url, log ) => {
    try {
      const response = await fetch("http://localhost:8000/api/update-a-page-games", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId,
          url,
          log
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log("Success");
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

  const fetchGames = async ( id ) => {        
    try {
      const response = await fetch("http://localhost:8000/api/query-a-database-games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id
        })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      setGames(result);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchGames(team.id);
  }, []);

  const handleCheckboxChange = (player) => {
      setData((prevData) => {
          if (prevData.some((p) => p.id === player.id)) {
              return prevData.filter((p) => p.id !== player.id);
          } else {
              return [...prevData, { id: player.id, name: player.name }];
          }
      });
  };

  const handleSelect = ( event ) => {
    setSelectedGame(event.target.value);
  };

  const processVideoClips = async () => {
    if (!blobData || timestamps.length === 0 || !videoProcessorRef.current?.isReady) {
        alert("No video or timestamps to process!");
        return;
    }

    setProcessingVideo(true);
    const clips = [];

    for (const { timestamp } of timestamps) {
        const startTime = Math.max(timestamp - 5, 0); // Ensure start time is not negative
        const duration = 10; // 10 seconds clip

        try {
            const clipUrl = await videoProcessorRef.current.createClip(blobData, startTime, duration);
            if (clipUrl) clips.push(clipUrl);
        } catch (error) {
            console.error("Error processing clip:", error);
        }
    }

    setProcessedClips(clips);
    setProcessingVideo(false);
};


  return (
    <div style = { { display : "flex", flexDirection : "row", paddingTop : "64px", width : "100vw", height : "100vh" } }>
      <div style = { { width : "200px", minWidth: "200px", height : "100%", overflow : "scroll", position : "fixed" } }>
        <p>Highlights ({ timestamps.length})</p>
        {timestamps.map((time, index) => (
            <p key = { index } style = { { whiteSpace : "nowrap"} }>⏱ {time.timestamp} : {time.name} </p>
        ))}
      </div>        

      <div className="" style = { { width : "100%", marginLeft : "200px", flexGrow : 1, flex : 1, overflowY : "auto", overflowX: "hidden", display : "flex", flexDirection : "column" } }>
        <h1>{teamName}</h1>
        <p className = "meta">Choose the game</p>

        <select onChange = { handleSelect } style = { { width : "300px" } }>
          <option>Select a game</option>
          { games.map( ( item, index ) => (
            <option key = { index } value = { item.id }>
              vs. { item.properties.team_opponent.rich_text[0]?.plain_text } | { item.properties.Date.date.start }
            </option>
          ))}
        </select>

        <div style = { { display : "flex", flexDirection : "row", gap : "8px" } }>
          <button onClick = { startRecording }>Start Recording</button>
          <button onClick = { endRecording } disabled = { !recording }>End Recording</button>
          <button onClick = { uploadRecording } disabled = { !videoURL || uploading }>{ uploading ? "Uploading..." : "Upload Video to S3" }</button>
          <button onClick = { getVideo } disabled = {!uploadedVideoUrl}>Get Uploaded Video</button>

          <button onClick = { () => updateGames(selectedGame, "aaa", "aaa") } disabled = { !videoURL || uploading }>Update DB with url and log</button>
          <button onClick = { () => postToGames("Name test", uploadedVideoUrl, JSON.stringify(timestamps)) } disabled = { !videoURL || uploading }>POST to DB (Games)</button>

          <button onClick = { logTimestamp } disabled={!recording}>TEST Log Timestamp</button>
          <button onClick = { () => console.log(timestamps) } disabled = { timestamps.length === 0 }>Console.log Timestamp</button>

          <button onClick={processVideoClips} disabled={!blobData || timestamps.length === 0 || processingVideo || !videoProcessorRef.current?.isReady}>
            {processingVideo ? "Processing Clips..." : "Process Video"}
          </button>

        </div>

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
        <div style={{ display: "flex", flexDirection: "row", gap: "8px", width : "100%", overflow : "scroll" }}>
            {players.map((item, index) => {
                const playerName = item.properties?.Name?.title?.[0]?.plain_text || "Unnamed Player";
                const firstName = item.properties?.first_name?.rich_text?.[0]?.plain_text || "";
                const lastName = item.properties?.last_name?.rich_text?.[0]?.plain_text || "";
                const backNumber = item.properties?.back_number?.rich_text?.[0]?.plain_text || "N/A";

                return (
                    <div key={item.id || index} style={{ backgroundColor: "var(--black8)", padding: "8px" }}>
                        <div style={{
                            width : "80px",
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
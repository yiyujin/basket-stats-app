import React, { useEffect, useRef, useState } from "react";

const LocalVideoPlayer = ({ videoPath, onPlayerReady }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      
      const playerObject = {
        getCurrentTime: () => videoElement.currentTime,
        getDuration: () => videoElement.duration,
        seekTo: (seconds) => {
          videoElement.currentTime = seconds;
        },
        playVideo: () => {
          videoElement.play();
        },
        pauseVideo: () => {
          videoElement.pause();
        }
      };
      onPlayerReady(playerObject);
    };

    // Set up time update tracking
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    // Setup interval for more frequent time updates
    intervalRef.current = setInterval(() => {
      setCurrentTime(videoElement.currentTime);
    }, 1000);

    // Cleanup
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoPath, onPlayerReady]);

  return (
    <div style={{ position: "relative", paddingTop: "56.25%", width: "100%" }}>
      <video
        ref={videoRef}
        controls
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        src = { videoPath }
      />
    </div>
  );
};

export default function LiftCounter() {
  const [player, setPlayer] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [highlightInputs, setHighlightInputs] = useState({});
  
  const videoPath = "rawfiles/test.MOV";

  useEffect(() => {
    const initialInputs = {};
    highlights.forEach((_, index) => {
      initialInputs[index] = "";
    });
    setHighlightInputs(initialInputs);
  }, [highlights]);

  const handleLogTimestamp = () => {
    if (!player) return;
  
    const currentTime = player.getCurrentTime();
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  
    const newHighlight = {
      time: timeString,
      timeInSeconds: Math.floor(currentTime),
      comments: [],
    };
    
    // Add the new highlight to the list
    setHighlights(prevHighlights => [newHighlight, ...prevHighlights]);
        
    // Reset input for the new highlight
    setHighlightInputs(prev => ({
      [0]: "",
      ...Object.fromEntries(Object.entries(prev).map(([key, val]) => [parseInt(key) + 1, val])),
    }));

    console.log(highlights);
  };  

  const seekToTime = (seconds) => {
    if (player) {
      const seekTime = Math.max(seconds - 1, 0); // one sec before
      player.seekTo(seekTime);
    }
  };

  // Handle comment input change for a specific highlight
  const handleCommentChange = (index, value) => {
    setHighlightInputs(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleCommentKeyPress = (index, event) => {
    if (event.key === "Enter" && highlightInputs[index]?.trim() !== "") {
      const commentName = name.trim();
      
      // Clone the highlights array to avoid direct state mutation
      const updatedHighlights = [...highlights];
      
      // Add the new comment
      updatedHighlights[index].comments.push({
        name: commentName,
        comment: highlightInputs[index].trim(),
      });
      
      // Update the state with new comments
      setHighlights(updatedHighlights);
      
      // Clear the input field
      handleCommentChange(index, "");
    }
  };

  return (
    <div style={{ paddingTop: "24px" }}>
    

      <div style={{ display: "flex", flexDirection: "row", marginTop: "80px", padding: "0px 16px", width: "100%", height: "100vh", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <h2>Highlight</h2>
          <p className="meta">For Analysis. Press the Highlight button to record timestamps. Add comments.</p>

          <LocalVideoPlayer videoPath={videoPath} onPlayerReady={setPlayer} />

          <br/>

          <button onClick={handleLogTimestamp} style={{ width: "100%", height: "56px", marginBottom: "8px", backgroundColor: "var(--black4)", color: "black", border: "1px solid", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            Highlight Current Timestamp
          </button>
        </div>

        <div style={{ gap: "16px", width: "30%", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <h2>Commentary</h2>

          <div>
            {highlights.length > 0 ? highlights.map((item, index) => (
              <div key={index} style={{ marginBottom: "12px", padding: "16px 12px", borderRadius: "8px", border: "1.5px solid rgba(var(--pt3), 0.16)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", paddingBottom: "8px" }}>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => seekToTime(item.timeInSeconds)} style={{ padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(var(--pt3), 1.0)", fontWeight: "600", color: "white", border: "none", cursor: "pointer" }}>
                      {item.time}
                    </button>
                  </div>

                  <span className="meta" style={{ flex: "flex-end" }}>{item.comments.length} comment{item.comments.length !== 1 ? "s" : ""}</span>
                </div>
                
                {item.comments.map((comment, cIndex) => (
                  <div key={cIndex} style={{ padding: "8px 0px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "var(--font-size-tiny)" }}>{comment.name}</span>
                    <p style={{ fontSize: "var(--font-size-small)", paddingTop: "4px" }}>{comment.comment}</p>
                  </div>
                ))}
                
                <input 
                  type="text" 
                  className="input-comment"
                  value={highlightInputs[index] || ""}
                  onChange={(e) => handleCommentChange(index, e.target.value)}
                  onKeyPress={(e) => handleCommentKeyPress(index, e)}
                  placeholder="Add a comment (Enter)"
                />
              </div>
            )) : <p className="meta">No highlight stamps.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
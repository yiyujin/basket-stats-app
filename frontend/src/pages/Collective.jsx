import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const videoId = "do6adKhUZ4U";
const socket = io("http://localhost:8000");

const YouTubePlayer = ({ onPlayerReady, isConductor }) => {
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new YT.Player("player", {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          autoplay: 0,
          controls: isConductor ? 1 : 0,
          rel: 0,
          fs: 1,
          disablekb: isConductor ? 0 : 1,
        },
        events: {
          onReady: (event) => {
            onPlayerReady(event.target);

            setDuration(event.target.getDuration());

            if (!isConductor) {
              event.target.getIframe().style.pointerEvents = "none"; // Block interactions
            }

            setInterval(() => {
              const time = event.target.getCurrentTime();
              setCurrentTime(time);
              
              // If conductor, periodically update server with current state
              if (isConductor) {
                const state = {
                  isPlaying: event.target.getPlayerState() === YT.PlayerState.PLAYING,
                  currentTime: time
                };
                socket.emit("updateVideoState", state);
              }
            }, 1000);
          },
          onStateChange: (event) => {
            if (isConductor) {
              if (event.data === YT.PlayerState.PLAYING) {
                console.log("Conductor playing, emitting playVideo...");
                socket.emit("playVideo", playerRef.current.getCurrentTime());
              } else if (event.data === YT.PlayerState.PAUSED) {
                console.log("Conductor paused, emitting pauseVideo...");
                socket.emit("pauseVideo", playerRef.current.getCurrentTime());
              }
            }
          },                            
        },
      });
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, [onPlayerReady, isConductor]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div style = { { position: "relative", paddingTop: "56.25%", width: "100%" } }>
        <div id = "player" style = { { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" } }/>
      </div>
      <p>Time: { formatTime(currentTime) } / { formatTime(duration) }</p>
  </div>
  );
};

export default function Collective() {
  const [player, setPlayer] = useState(null);
  const [socketId, setSocketId] = useState("");
  const [name, setName] = useState("");

  const [isConductor, setIsConductor] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [newViewerNotification, setNewViewerNotification] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      // const defaultName = `User-${socket.id.substring(0, 6)}`;
      setSocketId(socket.id);

      const defaultName = "";
      setName(defaultName);

      socket.emit("setUsername", { id: socket.id, name: defaultName });
    });

    socket.on("conductorAssigned", (conductorSocketId) => {
      setIsConductor(socket.id === conductorSocketId);
    });

    socket.on("userUpdates", setConnectedUsers);

    socket.on("highlightUpdates", setHighlights);

    socket.on("newViewerJoined", (data) => {
      setNewViewerNotification(data);
      
      if (player && isConductor) {
        console.log("New viewer joined, pausing video for sync...");
        const currentTime = player.getCurrentTime();
        player.pauseVideo();

        socket.emit("pauseVideo", currentTime); // pause all clients
        
        setTimeout(() => {
          setNewViewerNotification(null);
        }, 3000);
      }
    });

    socket.on("initialSync", (videoState) => {
      if (player && !isConductor) {
        console.log("Received initial sync:", videoState);
        player.seekTo(videoState.currentTime, true);
        
        if (videoState.isPlaying) {
          setTimeout(() => {
            player.playVideo();
          }, 300); // Small delay to ensure seek completes first
        } else {
          setTimeout(() => {
            player.pauseVideo();
          }, 300);
        }
      }
    });

    socket.on("syncPlay", (timestamp) => {
      if (player && !isConductor) {
        player.seekTo(timestamp, true);
        player.playVideo();
      }
    });

    socket.on("syncPause", (timestamp) => {
      if (player && !isConductor) {
        player.seekTo(timestamp, true);
        setTimeout(() => {
          player.pauseVideo();
          console.log("Viewer pausing video at:", timestamp);
        }, 300); // Delay pause slightly to ensure seek completes first
      }
    });    

    socket.on("syncSeek", (timestamp) => {
      if (player && !isConductor) {
        player.seekTo(timestamp, true);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("conductorAssigned");
      socket.off("userUpdates");
      socket.off("highlightUpdates");
      socket.off("newViewerJoined");
      socket.off("initialSync");
      socket.off("syncPlay");
      socket.off("syncPause");
      socket.off("syncSeek");
    };
  }, [player, isConductor]);

  const handleLogTimestamp = () => {
    if (!player) return;
    const currentTime = player.getCurrentTime();

    // Convert seconds to minutes:seconds format
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const newHighlight = {
      time : timeString,
      timeInSeconds : currentTime,
      userId : socketId,
      name : name,
    };

    socket.emit("addHighlight", newHighlight);
  };

  const seekToTime = ( seconds ) => {
    if (player) {
      const seekTime = Math.max(seconds - 5, 0);
      player.seekTo(seekTime, true);

      if (isConductor) {
        socket.emit("seekVideo", seconds);
      }
    }
  };

  // Update username on server when name changes
  useEffect(() => {
    if (socketId && name) {
      socket.emit("setUsername", { id: socketId, name : name });
    }
  }, [name, socketId]);

  return (
    <div style = { { display : "flex", flexDirection : "row", paddingTop : "64px", width : "100vw", height : "100vh" } }>

      <div style = { { gap : "40px", width : "20%", backgroundColor : "var(--black8)", padding : "16px", display : "flex", flexDirection : "column" } }>

        <div style = { { display : "flex", flexDirection : "column", gap : "8px" } }>
          <p className = "meta" style = { { padding : "2px 8px", backgroundColor : "var(--black16)", width: "max-content", borderRadius : "4px" } } >{ isConductor ? "Conductor" : "Viewer" }</p>
          <p>Connected ({ connectedUsers.length })</p>
          
          <div style = { { height : "16px", display : "flex", flexDirection : "row", gap : "8px", overflowX : "scroll" } }>
            { connectedUsers.map( ( user ) => (
              <p key = { user.id } className = "meta" style = { { display : "flex", flexDirection : "row" } }>
                <p>{ user.name }</p>
                <p>({ user.id.substring(0, 6) })</p>
              </p>
            ))}
          </div>
        </div>

        <div>
          { highlights.map( ( item, index ) => (
            <div key = { index } style = { { display : "flex", flexDirection : "row", alignItems : "center", gap : "4px", paddingBottom : "8px" } }>
              <button onClick = { () => seekToTime(item.timeInSeconds) }>{ item.time }</button>
              <p className = "meta">{ item.name }</p>
            </div>
          ))}
        </div>
      </div>
      
      <div style = { { flex : 1, padding : "0px 16px" } }>
        <h2>Collective Highlights</h2>
        <p className = "meta">This is made for analyzing purpose. Press Highlight button to record. You'll be able to replay these moments later.</p>

        <div style = { { height : "48px", backgroundColor : "var(--black4)", display : "flex", alignItems : "center", padding :"16px" } }>
          { newViewerNotification && isConductor ?
            ( <p className = "meta" style = { { color : "#e25152" } }>New viewer joined! Pausing video for synchronization...</p> ):
            ( <p className = "meta">Notification will show here</p> )
          }
        </div>

        <YouTubePlayer onPlayerReady = { setPlayer } isConductor = { isConductor } />

        <br/>

        <input type = "text" value = { name } onChange = { (e) => setName(e.target.value)} placeholder = "Name"/>
        <button style = { { width : "100%", height : "56px" } }onClick = { handleLogTimestamp }>Highlight</button>
      </div>

    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import Loading from "../components/Loading";

const videoId = "do6adKhUZ4U";

const YouTubePlayer = ({ onPlayerReady }) => {
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
          controls: 1,
          rel: 0,
          fs: 1,
        },
        events: {
          onReady: (event) => {
            onPlayerReady(event.target);
            setDuration(event.target.getDuration());

            setInterval(() => {
              const time = event.target.getCurrentTime();
              setCurrentTime(time);
            }, 1000);
          }
        },
      });
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, [onPlayerReady]);

  return (
    <div style = { { position: "relative", paddingTop: "56.25%", width: "100%" } }>
      <div id = "player" style = { { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" } }/>
    </div>
  );
};

export default function GameItem() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState([]);

  const fetchGame = async ( id ) => {
    try {
      const response = await fetch(`http://localhost:8000/api/retrieve-a-page-team?id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const result = await response.json();
      // console.log("game :", result.properties);
      setGame(result.properties);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const [player, setPlayer] = useState(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [currentHighlightComment, setCurrentHighlightComment] = useState("");
  const [currentCommentName, setCurrentCommentName] = useState("");
  
  // DUMMY DATA
  const [highlights, setHighlights] = useState([
    { 
      time: "0:45", 
      timeInSeconds: 45, 
      name: "Alex", 
      comments: [
        { name: "Alex", comment: "Great move by no.9" },
        { name: "Jordan", comment: "I disagree, should have waited." }
      ]
    },
    { 
      time: "2:13", 
      timeInSeconds: 133, 
      name: "Taylor", 
      comments: [
        { name: "Taylor", comment: "Key moment in the video" }
      ]
    },
  ]);

  // Track input values for each highlight
  const [highlightInputs, setHighlightInputs] = useState({});
  const [highlightInputNames, setHighlightInputNames] = useState({});

  // Initialize input states
  useEffect(() => {
    fetchGame(id);

    const initialInputs = {};
    const initialNames = {};
    highlights.forEach((_, index) => {
      initialInputs[index] = "";
      initialNames[index] = "";
    });
    setHighlightInputs(initialInputs);
    setHighlightInputNames(initialNames);
  }, []);

  const handleLogTimestamp = () => {
    if(!name){
      alert("Write down your name");
      return;
    }

    if (!player) return;
    const currentTime = player.getCurrentTime();
  
    // Convert seconds to minutes:seconds format
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
    const newHighlight = {
      time: timeString,
      timeInSeconds: currentTime,
      name: name,
      comments: []
    };
  
    setHighlights(prevHighlights => {
      const newHighlights = [newHighlight, ...prevHighlights]; // Insert at the beginning
  
      // Update input states for the new highlight
      setHighlightInputs(prev => ({
        [0]: "",
        ...Object.fromEntries(Object.entries(prev).map(([key, val]) => [parseInt(key) + 1, val]))
      }));
  
      setHighlightInputNames(prev => ({
        [0]: "",
        ...Object.fromEntries(Object.entries(prev).map(([key, val]) => [parseInt(key) + 1, val]))
      }));
  
      return newHighlights;
    });
  };
  

  const seekToTime = (seconds) => {
    if (player) {
      const seekTime = Math.max(seconds - 5, 0);
      player.seekTo(seekTime, true);
    }
  };

  // Handle comment input change for a specific highlight
  const handleCommentChange = (index, value) => {
    setHighlightInputs(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleNameChange = (index, value) => {
    setHighlightInputNames(prev => ({
      ...prev,
      [index]: value
    }));
  };


const handleCommentKeyPress = (index, event) => {
  if (event.key === "Enter" && highlightInputs[index].trim() !== "") {
    const commentName = name.trim() || "Anonymous";

    const updatedHighlights = [...highlights];
    updatedHighlights[index].comments.push({
      name: commentName,
      comment: highlightInputs[index]
    });

    setHighlights(updatedHighlights);

    handleCommentChange(index, "");

    setTimeout(() => {
      event.target.style.backgroundColor = "";
    }, 300);
  }
};


  // Format timestamp for display
  const formatTimestamp = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect( () => {
    if( game ){
      setLoading(false);
    }
  }, [game, highlights]);

  return (
    <>
    { loading ? <Loading/> : 
    <div style = { { display: "flex", flexDirection: "row", paddingTop: "64px", width: "100vw", height: "100vh" } }>
    
      <div style = { { flex: 1, padding: "0px 16px" } }>
        <h2>{ game.team1?.rich_text[0].plain_text } vs { game.team2?.rich_text[0].plain_text }</h2>
        <p className = "meta">For Analysis. Press the Highlight button to record timestamps. Add comments.</p>

        <YouTubePlayer onPlayerReady = { setPlayer } />

        <br/>

        <button onClick = { handleLogTimestamp } style = {{ width: "100%", height: "56px", marginBottom: "8px", backgroundColor: "var(--black4)", color: "black", border: "1px solid ", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }} >
          Highlight Current Timestamp
        </button>

        <input type = "text" value = { name } onChange = { (e) => setName(e.target.value) } placeholder="Your Name"/>
      </div>

      <div style = { { gap: "16px", width: "30%", padding: "16px", display: "flex", flexDirection: "column", overflowY: "auto" } }>
        <h2>Commentary</h2>

        <div>
          { highlights.map( ( item, index ) => (
            <div key = { index } style = { { marginBottom: "12px", padding: "16px 12px", borderRadius: "8px", border : "1.5px solid rgba(var(--pt3), 0.16)" } }>
              <div style = { { display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", paddingBottom : "8px" } }>
                
              <div style = { { display: "flex", alignItems: "center", gap: "8px" } }>
                <button onClick = { () => seekToTime(item.timeInSeconds) } style = { { padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(var(--pt3), 1.0)", fontWeight : "600", color: "white", border: "none", cursor: "pointer", }}>
                  { item.time }
                </button>

                <span className = "meta">by</span>
                <span style = { { fontSize : "var(--font-size-tiny)", marginLeft : "-4px"} }>{ item.name }</span>
              </div>

                <span className = "meta" style = { { flex : "flex-end"} }>{ item.comments.length } comment{ item.comments.length !== 1 ? 's' : '' }</span>
              </div>
              

            { item.comments.map( ( item, index ) => (
              <div key = { index } style = { { padding: "8px 0px" } }>
                <span style = {{ fontWeight: "bold", fontSize: "var(--font-size-tiny)" }}>{ item.name }</span>
                <p style = { { fontSize: "var(--font-size-small)", paddingTop : "4px" }}>{ item.comment }</p>
              </div>
              ))
            }
              
            <input type = "text" className = "input-comment"
              value = { highlightInputs[index] || "" }
              onChange = { (e) => handleCommentChange(index, e.target.value) }
              onKeyPress = { (e) => handleCommentKeyPress(index, e) }
              placeholder = "Add a comment (press Enter to post)"
            />
            </div>
          ))}
        </div>
      </div>
    </div>
}</>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

import Loading from "../components/Loading";
import GameChip from "../components/GameChip";

const YouTubePlayer = ({ videoId, onPlayerReady }) => {
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null); // Track interval to clear it later

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      window.onYouTubeIframeAPIReady = initializePlayer;

      if (!document.querySelector("script[src='https://www.youtube.com/iframe_api']")) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    const initializePlayer = () => {
      if (!videoId) return;

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

            intervalRef.current = setInterval(() => {
              setCurrentTime(event.target.getCurrentTime());
            }, 1000);
          },
        },
      });
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, onPlayerReady]);

  return (
    <div style={{ position: "relative", paddingTop: "56.25%", width: "100%" }}>
      <div id="player" style ={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
    </div>
  );
};

export default function GameItem() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState([]);
  const [videoId, setVideoId] = useState("");

  const location = useLocation();
  const players = location.state;
  
  // GOAL
  const [type, setType] = useState("");
  const [goaler, setGoaler] = useState("");

  const fetchGame = async (id) => {
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
      // console.log(result.properties);
      setGame(result.properties);
      setVideoId(result.properties.youtube_id.rich_text[0].plain_text);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const fetchHighlights = async (gameId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/query-a-database-highlights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: gameId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch highlights");
      }
      
      const result = await response.json();
      
      // Transform API response into your component's expected format
      const formattedHighlights = result.map(highlight => ({
        pageId: highlight.id, // Store the Notion page ID
        time: highlight.properties.time.rich_text[0]?.plain_text,
        timeInSeconds: parseInt(highlight.properties.time_in_seconds.rich_text[0]?.plain_text),
        name: highlight.properties.created_by.rich_text[0]?.plain_text,
        comments: highlight.properties.comments.rich_text[0]?.plain_text ? 
          JSON.parse(highlight.properties.comments.rich_text[0].plain_text) : [],
        type : highlight.properties.type.rich_text[0]?.plain_text,
        goaler : highlight.properties.goaler.rich_text[0]?.plain_text,
        player_id : highlight.properties.player_id.rich_text[0]?.plain_text, // 일단
        })
      );
      
      // console.log("formattedHighlights", formattedHighlights);
      setHighlights(formattedHighlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      setHighlights([]); // Set to empty array if fetch fails
    } finally {
      setLoading(false);
    }
  };

  async function saveHighlightToNotion(gameId, highlight) {
    try {
      const response = await fetch("http://localhost:8000/api/create-a-page-highlights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: gameId,
          data: {
            time: highlight.time,
            time_in_seconds: String(Math.floor(highlight.timeInSeconds)),
            created_by: highlight.name,
            type: highlight.type,
            goaler: highlight.goaler,
            comments: JSON.stringify(highlight.comments),
          },
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save highlight to Notion");
      }
  
      const result = await response.json();
      console.log("Highlight saved:", result);
      return result.id;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  }

  async function updateHighlightComments(pageId, updatedComments) {
    if (!pageId) {
      console.warn("No pageId found for this highlight. Skipping update.");
      return false;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/update-a-page-highlights", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId,
          comments: JSON.stringify(updatedComments),
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update comments");
      }
  
      const result = await response.json();
      console.log("Comments updated");
      return true;
    } catch (err) {
      console.error("Error updating comments:", err);
      return false;
    }
  }

  const updateHighlightTypeAndGoaler = async (pageId, type, goaler, player_id) => {
    if (!pageId) {
      console.warn("No pageId found for this highlight. Skipping update.");
      return false;
    }

    console.log(player_id);
    
    try {
      const response = await fetch("http://localhost:8000/api/update-a-page-highlights-type", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId,
          type,
          goaler,
          player_id
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update type and goaler");
      }
  
      const result = await response.json();
      console.log("Type and goaler updated:", result);
      return true;
    } catch (err) {
      console.error("Error updating type and goaler:", err);
      return false;
    }
  };  

  const [player, setPlayer] = useState(null);
  const [name, setName] = useState("");
  const [highlights, setHighlights] = useState([]);
  const [highlightInputs, setHighlightInputs] = useState({});

  // Initialize data on load
  useEffect(() => {
    const initializeData = async () => {
      await fetchGame(id);
      await fetchHighlights(id);
      await fetchPlayers(team);
    };
    
    if (id) {
      initializeData();
    }
  }, [id]);

  // Update input states when highlights change
  useEffect(() => {
    const initialInputs = {};
    highlights.forEach((_, index) => {
      initialInputs[index] = "";
    });
    setHighlightInputs(initialInputs);
  }, [highlights]);

  const handleLogTimestamp = async () => {
    if (!name) {
      alert("Write down your name");
      return;
    }
  
    if (!player) return;
  
    const currentTime = player.getCurrentTime();
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  
    const newHighlight = {
      time: timeString,
      timeInSeconds: Math.floor(currentTime),
      name: name,
      type: type,
      goaler: goaler,
      comments: [],
    };
  
    try {
      // Save to Notion and get the pageId
      const pageId = await saveHighlightToNotion(id, newHighlight);
  
      if (pageId) {
        // Add the pageId to our highlight object
        const highlightWithPageId = { ...newHighlight, pageId };
        
        setHighlights(prevHighlights => [highlightWithPageId, ...prevHighlights]);
        
        // Reset input for the new highlight
        setHighlightInputs(prev => ({
          [0]: "",
          ...Object.fromEntries(Object.entries(prev).map(([key, val]) => [parseInt(key) + 1, val])),
        }));
      } else {
        alert("Failed to save highlight to Notion");
      }
    } catch (err) {
      console.error("Failed to create highlight:", err);
      alert("Error creating highlight");
    }
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

  const handleCommentKeyPress = async (index, event) => {
    if (event.key === "Enter" && highlightInputs[index].trim() !== "") {
      const commentName = name.trim();
      
      // Clone the highlights array to avoid direct state mutation
      const updatedHighlights = [...highlights];
      
      // Add the new comment
      updatedHighlights[index].comments.push({
        name: commentName,
        comment: highlightInputs[index].trim(),
      });
      
      // Get the pageId for this highlight
      const pageId = updatedHighlights[index].pageId;
      
      // Only try to update Notion if we have a pageId
      if (pageId) {
        const success = await updateHighlightComments(
          pageId,
          updatedHighlights[index].comments
        );
        
        if (success) {
          // Update the state with new comments
          setHighlights(updatedHighlights);
          // Clear the input field
          handleCommentChange(index, "");
        } else {
          alert("Failed to save comment to Notion");
        }
      } else {
        console.warn("No pageId found for this highlight. Skipping update.");
        // Even if we can't save to Notion, update the UI
        setHighlights(updatedHighlights);
        handleCommentChange(index, "");
      }
    }
  };

  return (
    <> { loading ? <Loading/> : 
      <div style = { { paddingTop : "80px" } }>

        <div style = { { width : "100%", display : "flex", flexDirection : "column", alignItems : "center" } }>
          <div style = { { width : "", display : "flex", flexDirection : "row", gap : "40px", alignItems : "" } }>
            <div style = { { display : "flex", flexDirection : "column", gap : "8px" } }>
              <h2>{ game.team1?.rich_text[0].plain_text }</h2>
              { highlights.map((item, index) =>
                item.type === "Goal" && item.goaler !== "Opponent" ? (
                  <div key={index}>
                    <GameChip item = { item } reverse seekToTime={seekToTime} />
                  </div>
                ) : null
              )}

            </div>
            
            <div style = { { width : "72px", margin : "0px 8px" } }>
              <div style = { { backgroundColor : "var(--black4)", textAlign : "center", borderRadius : "var(--br)" }}>
                <h2 className = "number" style = { { fontSize : "var(--font-size-large)"} }>{ game.score.rich_text[0]?.plain_text }</h2>
              </div>
            </div>

            <div style = { { display : "flex", flexDirection : "column", gap : "8px" } }>
              <h2>{ game.team2?.rich_text[0].plain_text }</h2>
              { highlights.map((item, index) =>
                item.type === "Goal" && item.goaler === "Opponent" ? (
                  <div key={index}>
                    <GameChip item = { item } seekToTime={seekToTime} />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        <hr/>


      <div style = { { display: "flex", flexDirection: "row", marginTop : "80px", padding: "0px 16px", width: "100vw", height: "100vh", gap : "16px" } }>
        <div style = { { flex: 1 } }>
          <h2>Highlight</h2>
          <p className = "meta">For Analysis. Press the Highlight button to record timestamps. Add comments.</p>

          <YouTubePlayer videoId={videoId} onPlayerReady={setPlayer} />

          <br/>

          <button onClick = { handleLogTimestamp } style = {{ width: "100%", height: "56px", marginBottom: "8px", backgroundColor: "var(--black4)", color: "black", border: "1px solid ", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }} >
            Highlight Current Timestamp
          </button>

          <input type = "text" value = { name } onChange = { (e) => setName(e.target.value) } placeholder="Your Name"/>
        </div>

        <div style = { { gap: "16px", width: "30%", display: "flex", flexDirection: "column", overflowY: "auto" } }>
          <h2>Commentary</h2>

          <div>
            { highlights.length > 0 ? highlights.map( ( item, index ) => (
              <div key = { index } style = { { marginBottom: "12px", padding: "16px 12px", borderRadius: "8px", border : "1.5px solid rgba(var(--pt3), 0.16)" } }>
                <div style = { { display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", paddingBottom : "8px" } }>
                  
                <div style = { { display: "flex", alignItems: "center", gap: "8px" } }>
                  <button onClick = { () => seekToTime(item.timeInSeconds) } style = { { padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(var(--pt3), 1.0)", fontWeight : "600", color: "white", border: "none", cursor: "pointer", }}>
                    { item.time }
                  </button>

                  <span className = "meta">by</span>
                  <span style = { { fontSize : "var(--font-size-tiny)", marginLeft : "-4px"} }>{ item.name }</span>

                  <div style={{ width: "60px", display: "flex", flexDirection: "row", gap : "4px" }}>
                    <select 
                      id={`type-${index}`} 
                      value={item.type || ""} 
                      onChange={async (e) => {
                        const newType = e.target.value;
                        // Update local state
                        const updatedHighlights = [...highlights];
                        updatedHighlights[index].type = newType;
                        setHighlights(updatedHighlights);
                        
                        await updateHighlightTypeAndGoaler(item.pageId, newType, item.goaler, item.player_id);
                      }}
                    >
                      <option value="" disabled>Type</option>
                      <option value="Highlight">Highlight</option>
                      <option value="Goal">Goal</option>
                      <option value="Save">Assist</option>
                      <option value="Save">Save</option>
                      <option value="Foul">Foul</option>
                    </select>

                    <select 
  id={`goaler-${index}`} 
  value={item.player_id === "Team" || item.player_id === "Opponent" ? item.goaler || "" : item.player_id || ""}
  onChange={async (e) => {
    const selectedPlayerId = e.target.value;

    // Find selected player (or set a label for "Team" / "Opponent")
    let newGoalerLabel = selectedPlayerId;
    if (selectedPlayerId === "Team" || selectedPlayerId === "Opponent") {
      newGoalerLabel = selectedPlayerId;
    } else {
      const selectedPlayer = players.find(player => player.id === selectedPlayerId);
      if (selectedPlayer) {
        const backNumber = selectedPlayer.properties.back_number.rich_text[0]?.plain_text || "";
        const firstName = selectedPlayer.properties.first_name.rich_text[0]?.plain_text || "";
        const lastName = selectedPlayer.properties.last_name.rich_text[0]?.plain_text || "";
        newGoalerLabel = `${backNumber} - ${firstName} ${lastName}`;
      }
    }

    // Update local state immediately
    setHighlights(prevHighlights => {
      const newHighlights = [...prevHighlights];
      newHighlights[index] = {
        ...newHighlights[index],
        goaler: newGoalerLabel,
        player_id: selectedPlayerId
      };

      // Trigger API call here so it uses fresh data
      updateHighlightTypeAndGoaler(
        newHighlights[index].pageId,
        newHighlights[index].type,
        newGoalerLabel,
        selectedPlayerId
      ).catch(error => {
        console.error("Failed to update player:", error);
      });

      return newHighlights;
    });
  }}
>
  <option value="" disabled>Player</option>

  {players.map((player, index) => {
    const backNumber = player.properties.back_number.rich_text[0].plain_text;
    const firstName = player.properties.first_name.rich_text[0].plain_text;
    const lastName = player.properties.last_name.rich_text[0].plain_text;
    const label = `${backNumber} - ${firstName} ${lastName}`;
    return (
      <option key={index} value={player.id}>
        {label}
      </option>
    );
  })}

  <option value="Team">Team</option>
  <option value="Opponent">Opponent</option>
</select>

                  </div>

                </div>

                  <span className = "meta" style = { { flex : "flex-end"} }>{ item.comments.length } comment{ item.comments.length !== 1 ? 's' : '' }</span>
                </div>
                
              { item.comments.map( ( comment, cIndex ) => (
                <div key = { cIndex } style = { { padding: "8px 0px" } }>
                  <span style = {{ fontWeight: "bold", fontSize: "var(--font-size-tiny)" }}>{ comment.name }</span>
                  <p style = { { fontSize: "var(--font-size-small)", paddingTop : "4px" }}>{ comment.comment }</p>
                </div>
                ))
              }
                
              <input type = "text" className = "input-comment"
                value = { highlightInputs[index] || "" }
                onChange = { (e) => handleCommentChange(index, e.target.value) }
                onKeyPress = { (e) => handleCommentKeyPress(index, e) }
                placeholder = "Add a comment (Enter)"
              />
              </div>
            )) : <p className = "meta">No highlight stamps.</p>}
          </div>
        </div>
      </div>
    </div>
    }</>
  );
}
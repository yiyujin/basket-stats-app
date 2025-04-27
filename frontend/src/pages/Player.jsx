import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import Loading from "../components/Loading";
import PlayerRow from "../components/PlayerRow";
import StatsChip from "../components/StatsChip";
import YouTubePlayer from "../components/YoutubePlayer";

export default function Player(){
    const { id } = useParams();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [highlights, setHighlights] = useState([]);

    // VIDEO VARIABLE 
    const videoId = "3WeO2xRQHg0";
    const [player, setPlayer] = useState(null);

    const seekToTime = (seconds) => {
      if (player) {
        const seekTime = Math.max(seconds - 5, 0);
        player.seekTo(seekTime, true);
      }
    };

    const fetchData = async ( id ) => {
      try {
        const response = await fetch(`http://localhost:8000/api/retrieve-a-page-player?id=${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
    
        const result = await response.json()
        // console.log(result.properties);
        setData(result.properties);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    const fetchHighlights = async (id) => {
      try {
        const response = await fetch(`http://localhost:8000/api/query-a-database-highlights-player`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id }),
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
        
        console.log("formattedHighlights", formattedHighlights);
        setHighlights(formattedHighlights);
      } catch (error) {
        console.error("Error fetching highlights:", error);
        setHighlights([]); // Set to empty array if fetch fails
      }
    };

    useEffect(() => {
      fetchData(id);
      fetchHighlights(id);
      }, []);

    return(
      <>
        { loading ? <Loading/> : 
          <div style = { { paddingTop : "56px" }}>
            <div style = { { display : "flex", flexDirection : "row", alignItems : "center", width : "100%", height : "300px", backgroundColor : "#fe4801", paddingTop : "24px", overflow : "hidden" } }>
              
              <img style = { { bottom : "0", height : "300px", marginLeft : "5%", position : "" } } src = { data.profile_picture?.rich_text[0]?.plain_text || "https://am-a.akamaihd.net/image?resize=375:&f=http://static.lolesports.com/players/silhouette.png" }/>
              
              <div style = { { color : "white" } }>
                <h1 style = { { fontSize : "40px" } }>{ data.first_name.rich_text[0].plain_text } { data.last_name.rich_text[0].plain_text } </h1>
                <h1 className = "number" style = { { fontSize : "64px" }}>{ data.back_number?.rich_text[0].plain_text }</h1>
              </div>

            </div>

            <div className = "page">
              <div style = { { display : "flex", flexDirection : "row", gap : "40px" } }>

                <div className = "dashboard-nav-container">
                  <h3 className = "dashboard-nav">Personal Details</h3>
                  <h3 className = "dashboard-nav">Stats</h3>
                  <h3 className = "dashboard-nav">Highlights</h3>
                  <h3 className = "dashboard-nav">Gallery</h3>
                </div>

                <div style = { { width : "100%" } }>
                  <h2 style = { { paddingBottom : "8px" } }>Personal Details</h2>

                  <PlayerRow head = "Club" body = { data.Rollup?.rollup.array[0].title[0].plain_text } link = { `/team/${data.Teams?.relation[0].id}`}/>

                  <PlayerRow head = "Position" body = { data.position_rollup?.rollup.array[0].title[0].plain_text }/>

                  <PlayerRow head = "Back Name" body = { data.Name?.title[0].plain_text }/>

                  <PlayerRow head = "Nickname" body = { data.nickname?.rich_text[0].plain_text }/>

                  <PlayerRow head = "Nationality" body = { data.nationality.rich_text[0].plain_text }/>

                  <PlayerRow head = "Date of Birth" body = { data.birthday.rich_text[0].plain_text }/>
                  <PlayerRow head = "Height" body = { data.height.rich_text[0].plain_text }/>

                  <h2 style = { { paddingTop : "72px", paddingBottom : "8px" } }>Stats</h2>

                  <div style = { { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", width: "100%" } }>
                    <StatsChip head = "Appearances" body = "16"/>
                    <StatsChip head = "Goals" body = "2"/>
                    <StatsChip head = "Wins" body = "10"/>
                    <StatsChip head = "Losses" body = "2"/>
                  </div>

                  <h2 style = { { paddingTop : "72px", paddingBottom : "8px" } }>Highlights</h2>

                
                  <div style = { { display : "flex", flexDirection : "row", gap : "8px" } }>

                  <div style = { { display : "flex", flexDirection : "column", gap : "8px" } }>
                  { highlights.map( ( item, index ) => (
                      <div key = { index } onClick = { () => seekToTime(item.timeInSeconds)} style = { { display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", padding: "2px 8px", borderRadius: "4px", backgroundColor: "var(--black4)", fontWeight: "600", color: "var(--pt0)", border: "none", cursor: "pointer" } }>
                        { item.type === "Goal" && <img width = "12px" src = "https://www.premierleague.com/resources/rebrand/v7.153.55/i/elements/icons/ball-small.svg" alt = "ball" /> }
                        <p>{ item.time }</p>
                      </div>
                  ))}
                  </div>

                  <YouTubePlayer videoId={videoId} onPlayerReady={setPlayer} />

                  </div>


                  <h2 style = { { paddingTop : "72px", paddingBottom : "8px" } }>Gallery</h2>
                </div>

              </div>
            </div>
          </div>
        }
      </>
    )
}
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import VideoModal from "../components/VideoModal";
import Loading from "../components/Loading";
import IconButton from "../components/IconButton";
import GameListItem from "../components/GameListItem";
import TeamDivider from "../components/TeamDivider";

import { ArrowForward } from '@mui/icons-material';

export default function Team(){
    const { id } = useParams();

    const [data, setData] = useState([]);
    const [teamColor, setTeamColor] = useState([]);
    const [players, setPlayers] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const icons = [
      { name : "Center", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJHsPV3l1kHS1wiqQ8jrzsBQo4iOAlpqsHzQ&s", },
      { name : "Goalkeeper", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJHsPV3l1kHS1wiqQ8jrzsBQo4iOAlpqsHzQ&s", },
      { name : "Forward", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScb0MARSnN12orbWvqNA17hMjw-uPCdJOl3g&s", },
      { name : "Midfielder", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScb0MARSnN12orbWvqNA17hMjw-uPCdJOl3g&s", },
      { name : "Guard", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFZeyh52YNkVK9p3QwNWCAKUzS52fPhRPq3Q&s", },
      { name : "Defender", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFZeyh52YNkVK9p3QwNWCAKUzS52fPhRPq3Q&s", },
    ];

    const iconMap = Object.fromEntries(
      icons.map(icon => [icon.name, icon.url])
    );

    const fetchData = async ( id ) => {
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

        setData(result);
        setTeamColor(result.properties?.color.rich_text[0].plain_text || 'transparent');
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    const fetchPlayers = async ( id ) => {        
      try {
        const response = await fetch("http://localhost:8000/api/query-a-database-players", {
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
        setPlayers(result);
      } catch (error) {
        console.error("Error fetching data:", error.message);
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
      fetchData(id);
      fetchPlayers(id);
      fetchGames(id);
    }, []);

    useEffect( () => {
      // if(data){
      //   console.log(data);
      // }

      // if(players){
      //   console.log("asd",players)
      // }

      setLoading(false);
    }, [data]);

    const highlights = [
      {
          title : "DBK's 3pt Play",
          players : "DBK, DO",
          scorer : "DBK",
          video_id : "jfgWojrwE74",
          link : "https://www.youtube.com/embed/jfgWojrwE74?si=8Dha-oIF4lXlbRcJ"
      },
      {
          title : "DBK's 2pt Play",
          players : "DBK, Rob",
          scorer : "DBK",
          video_id : "s-IwazC6GXw",
          link : "https://www.youtube.com/embed/s-IwazC6GXw?si=PQavN-WZl5_KOWlz"
      },
      {
          title : "DBK's Steal",
          players : "DBK",
          scorer : "DBK",
          video_id : "LsLTfRKGfno",
          link : "https://www.youtube.com/embed/LsLTfRKGfno?si=KMON-mUNmTE3BXda"
      },
      {
          title : "DBK's 2pt Play",
          players : "DBK, Rob",
          scorer : "DBK",
          video_id : "X8fe76BYjkk",
          link : "https://www.youtube.com/embed/X8fe76BYjkk?si=Ng7O3QD1-LfgqHQZ"
      },
      {
          title : "DBK's 2pt Play",
          players : "DBK, Rob",
          scorer : "DBK",
          video_id : "7ftWRDfKXmg",
          link : "https://www.youtube.com/embed/X8fe76BYjkk?si=Ng7O3QD1-LfgqHQZ"
      },
      {
          title : "DBK's 2pt Play",
          players : "DBK",
          scorer : "DBK",
          video_id: "91MrognEtf4",
          link : "https://www.youtube.com/embed/7ftWRDfKXmg?si=45lIMOAdqInXCmIh"
      }
  ]

    return (
      <div className = "page">

        <div className = "banner">
          <div className = "img-banner-container">
            <img className = "img-banner" src = { data.icon?.file.url ? data.icon?.file.url : process.env.PUBLIC_URL + '/logo.png' }/>
          </div>
          
          <div className = "banner-text" style = { { backgroundColor: teamColor }}>
            <h1>{ data && data.properties?.Name.title[0].plain_text }</h1>
            <p>{ players.length } members  ·  New York  ·  Since 2022</p>
          </div>
        </div>
        
        <div style = { { display : "flex", flexDirection : "row", gap : "8px" } }>
          
          <div className = "dashboard-nav-container">
            <h3 className = "dashboard-nav">Games</h3>
            <h3 className = "dashboard-nav">Highlights</h3>
            <h3 className = "dashboard-nav">Players</h3>
            <h3 className = "dashboard-nav">Gallery</h3>
          </div>

          <div style = { { flex : 1 } }>

            <TeamDivider text = "Games" length = { games.length }/>
            <GameListItem id = { id } icon = { data.icon?.file.url ? data.icon?.file.url : process.env.PUBLIC_URL + '/logo.png' } color = { teamColor } data = { games }/>

            <TeamDivider text = "Highlights" length = ""/>
            
            <div className = "grid-container">
              { highlights.map( ( item, index) => (
                      <div key = { index } className = "grid-item">
                          

                          <div className = "highlight-container">
                              {/* <img src = { process.env.PUBLIC_URL + '/graphics/thumbnail.png' }/> */}
                              <VideoModal videoId = { item.video_id }/>

                              <img className = "highlight-thumbnail" src = "https://i.namu.wiki/i/FJgVhMvYkDgVdPfiENuaEtgJo11sef1SpxP4jx6lmMXMQ43bgmkxR3IlmdzPKqk91V4E_zoP0pF4RWhx-qcS-Q.webp"/>
                          </div>

                          <div className = "highlight-text">
                              <h3>{ item.title }</h3>
                              <p className = "meta">{ item.players }</p>
                          </div>
                      </div>
                  ) )}
            </div>
            
            <TeamDivider text = "Players" length = { players.length }/>
            { players.map( ( item, index) => (
              <div style = { { display : "flex", width : "100%", height : "80px", alignItems : "center", backgroundColor : "var(--black4)", padding : "4px", marginBottom : "8px"} }>
                
                <div style = { { flex : 1, display : "flex", flexDirection : "row", gap : "0px",alignItems : "center" } }>
                  <div className = "icon-container">
                    <img className = "icon" src = { iconMap[item.properties.position_rollup?.rollup.array[0].title[0].plain_text] }/>
                  </div>

                  <div className = "icon-container">
                    <p className = "number">{ item.properties.back_number.rich_text[0].plain_text }</p>
                  </div>
                
                  <h2 style = { { marginRight : "8px" } }>{ item.properties.first_name.rich_text[0].plain_text } { item.properties.last_name.rich_text[0].plain_text }</h2>
                  <p className = "meta">{ item.properties.Name.title[0].plain_text } · { item.properties.position_rollup?.rollup.array[0].title[0].plain_text }</p>
                  
                </div>

                <Link key = { index } to = {`/player/${item.id}`}>
                  <IconButton icon = { ArrowForward }/>
                </Link>
                
              </div>
            ) )}
          </div>     

        </div>

      </div>
    );
}
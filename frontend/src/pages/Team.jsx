import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import Loading from "../components/Loading";
import IconButton from "../components/IconButton";
import GameListItem from "../components/GameListItem";
import TeamDivider from "../components/TeamDivider";
import Chip from "../components/Chip";
import PlayerListItem from "../components/PlayerListItem";

import { ArrowForward, EventAvailable, Stadium } from '@mui/icons-material';

export default function Team(){
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [teamColor, setTeamColor] = useState([]);
  const [teamPhoto, setTeamPhoto] = useState([]);

  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [gameHighlights, setGameHighlights] = useState({}); // Map of game ID to highlight count
  const [opponentGames, setOpponentGames] = useState([]); // opponent games for analysis
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(1); // 1 for first tab, 2 for second tab

  function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(+year, +month - 1, +day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }  

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
      console.log("result", result);

      setData(result);
      setTeamPhoto(result.cover?.file.url);
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

      const games = result.filter(game => 
        game.properties.team1.rich_text?.[0]?.plain_text === data.properties?.Name?.title?.[0]?.plain_text
      );
      
      const opponentGames = result.filter(game => 
        game.properties.team1.rich_text?.[0]?.plain_text !== data.properties?.Name?.title?.[0]?.plain_text
      );        

      console.log("games", games);
      setGames(games);
      setOpponentGames(opponentGames);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const fetchHighlights = async (gameId) => {        
    try {
      const response = await fetch("http://localhost:8000/api/query-a-database-highlights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: gameId
        })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      
      // Update the gameHighlights state with the count for this specific game
      setGameHighlights(prev => ({
        ...prev,
        [gameId]: result.length
      }));
      
    } catch (error) {
      console.error("Error fetching highlights:", error.message);
    }
  };
          
  useEffect(() => {
    fetchData(id);
    fetchPlayers(id);
  }, []);

  useEffect(() => {
    if (data && players) {
      fetchGames(id);
    }
  }, [data, players, id]);

  useEffect(() => {
    // Fetch highlights for each game
    if (games.length > 0) {
      games.forEach(game => {
        fetchHighlights(game.id);
      });
    }
  }, [games]);  

  const allLoaded =
    data &&
    players &&
    games &&
    opponentGames &&
    teamColor &&
    teamPhoto;

  useEffect(() => {
    if (allLoaded) {
      setLoading(false);
      console.log('loading to false');
    }
  }, [allLoaded]);

  const groupedPlayersByPosition = Object.entries(
    players.reduce((acc, player) => {
      const position = player.properties.position_rollup?.rollup.array[0]?.title[0]?.plain_text || "Unknown";
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(player);
      return acc;
    }, {})
  );

  return (
      <>
        { loading ? <Loading/> :

        <div>
          
          <div style = { { paddingTop : "56px" } }>
            <div style = { { overflow : "hidden", position : "absolute", zIndex : "-1", width : "100%", height : "400px", backgroundSize : "cover", backgroundPosition : "center", backgroundRepeat : "no-repeat", backgroundImage : `url(${teamPhoto})` } }>
            <span style = { { position: "absolute", top: "-25%", left: "40%", width: "200%", height: "400%", backgroundColor: teamColor, transform: "rotate(-20deg)", zIndex: -2, opacity : 0.25 } }></span>
            </div>
          </div>

          <div className = "page">
            <div className = "banner">
              <div className = "img-banner-container">
                <img className = "img-banner" src = { data.icon?.file.url ? data.icon?.file.url : "" }/>
              </div>
              
              <div className = "banner-text" style = { { backgroundColor: teamColor, display : "flex", flexDirection : "row", alignItems : "center" }}>
                <div style = { { flex : 1 } }>
                  <h1>{ data && data.properties?.Name.title[0].plain_text }</h1>
                  <p>{ players.length } members  ·  New York  ·  Since 2022</p>
                </div>

                
                <Link to = {`/game`} state = { { team : data, players : players } }>
                  Start Game
                </Link>

              </div>
            </div>
            
            <div style = { { display : "flex", flexDirection : "row", gap : "40px" } }>
              
              <div className = "dashboard-nav-container">
                <p>Games</p>
                <p>Highlights</p>
                <p>Squad</p>
                <p>Gallery</p>
              </div>

              <div style = { { width : "100%"} }>
                <div style = { { display : "flex", flexDirection : "row", gap : "16px", borderBottom : "2px solid var(--black8)" }}>
                  <h3 onClick = { () => setActiveTab(1) } style = { {  cursor: "pointer", borderBottom: activeTab === 1 ? "2px solid black" : "none", marginBottom: "-2px" } }>Games ({ games.length })</h3>
                  <h3 onClick = { () => setActiveTab(2) }  style = { {  cursor: "pointer", borderBottom: activeTab === 2 ? "2px solid black" : "none", marginBottom: "-2px" } }>Opponent Games ({ opponentGames.length })</h3>
                </div>
                { activeTab === 1 ? (
                  <div>
                    {Object.entries(
                      games.reduce((acc, game) => {
                        const date = game.properties?.Date?.date?.start || "No Date";
                        if (!acc[date]) {
                          acc[date] = [];
                        }
                        acc[date].push(game);
                        return acc;
                      }, {})
                    )
                    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // <- Optional: newest dates first
                    .map(([date, gamesOnDate]) => (
                      <div key={date}>
                        <div style={{ marginTop: "40px", marginBottom : "4px", display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
                        <h3>{formatDate(date)}</h3>

                        {gamesOnDate.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "row", gap: "4px", alignItems: "center" }}>
                            <Stadium style={{ fontSize: "14px", color: "black" }} />
                            <p className="meta">
                              {gamesOnDate[0].properties?.venue?.rich_text[0]?.plain_text || "-"}
                            </p>
                          </div>
                        )}

                        { new Date(date) > new Date() && (
                          <Chip text={`D - ${Math.ceil((new Date(date) - new Date()) / (1000 * 3600 * 24))}`} color = { teamColor }/>
                        ) }


                        </div>

                        {/* Display all games for this date */}
                        {gamesOnDate.map((game) => (
                          <GameListItem
                            key={game.id}
                            id={game.id}
                            icon={data.icon?.file.url || ""}
                            color={teamColor}
                            data={game}
                            team={data}
                            players={players}
                            highlightsLen={gameHighlights[game.id] || 0}
                          />
                        ))}
                      </div>
                    ))}

                  </div>                 
                ) : (
                  opponentGames.map( ( item, index ) => (
                    <div key = { index } style = { { fontWeight : "600", display : "flex", width : "100%", height : "80px", alignItems : "center", borderBottom : "1px solid var(--black8)", gap : "40px" } }>
                      <p>{ item.properties.team1.rich_text[0]?.plain_text } vs { item.properties.team2.rich_text[0]?.plain_text }</p>

                        <div style = { { display : "flex", flexDirection : "row", gap : "4px", alignItems : "center" } }>
                          <EventAvailable style = { { fontSize: '14px' } }/>
                          <p className = "meta">{ item.properties.Date.date.start }</p>
                        </div>

                      <Link to = {`/gameitem/${item.id}`}>
                          <IconButton icon = { ArrowForward }/>
                      </Link>
                    </div>
                  ))
                )}

                <TeamDivider text = "Highlights" length = ""/>
                
                <TeamDivider text = "Squad" length = { players.length }/>
                
                {groupedPlayersByPosition.map(([position, playersInPosition]) => (
                  <div key={position}>
                    <h2 style={{ marginTop: "40px", marginBottom: "16px" }}>{position}s</h2>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",  gap: "16px" }}>
                      {playersInPosition.map((player) => (
                        <PlayerListItem key={player.id} item={player} teamColor = { teamColor } />
                      ))}
                    </div>
                  </div>
                ))}

                <TeamDivider text = "Gallery" length = ""/>
              </div>     

            </div>

          </div>
          </div>
        }
      </>
    );
}
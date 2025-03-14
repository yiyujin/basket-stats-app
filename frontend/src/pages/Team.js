import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import VideoModal from "../components/VideoModal";
import Loading from "../components/Loading";

export default function Team(){
    const { id } = useParams();

    const [data, setData] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);


    const icons = [
      { name : "Forward", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJHsPV3l1kHS1wiqQ8jrzsBQo4iOAlpqsHzQ&s", },
      { name : "Center", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScb0MARSnN12orbWvqNA17hMjw-uPCdJOl3g&s", },
      { name : "Guard", url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFZeyh52YNkVK9p3QwNWCAKUzS52fPhRPq3Q&s", },
    ];

    const iconMap = Object.fromEntries(
      icons.map(icon => [icon.name, icon.url])
    );

    console.log(iconMap)
    

    const fetchData = async ( id ) => {
      try {
        const response = await fetch(`http://localhost:8000/api/retrieve-a-page-teams?id=${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
    
        const result = await response.json();

        setData(result.properties);
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
  
    
          
    useEffect(() => {
      fetchData(id);
      fetchPlayers(id);
    }, []);

    useEffect( () => {
      // if(data){
      //   console.log(data);
      // }

      if(players){
        console.log("asd",players)
      }

      setLoading(false);
    }, [data]);

    return (
      <div className = "page">

        <div className = "player-banner">
          <p>{ players.length } members  ·  New York  ·  Since 2022</p>
          <h1>{ data && data.Name?.title[0]?.plain_text }</h1>
        </div>

        <br/>
    
        <h2>Players :</h2>

        <div className = "grid-container">
          { players.map( ( item, index) => (
            <div key = { index } className = "grid-item">
                <img className = "profile-image" height = "200px" src = "https://i.namu.wiki/i/FJgVhMvYkDgVdPfiENuaEtgJo11sef1SpxP4jx6lmMXMQ43bgmkxR3IlmdzPKqk91V4E_zoP0pF4RWhx-qcS-Q.webp"/>
                
                <div style = { { display : "flex", flexDirection : "row" } }>
                    <img className = "icon" src = { iconMap[item.properties.position.rich_text[0].plain_text] || icons[3].url }/>
                    <h1 style = { { fontFamily : "var(--font-Barlow)"} }>{ item.properties.back_number.rich_text[0].plain_text}</h1>
                    <div>
                        <h3>{ item.name }</h3>
                        <p className = "meta">{ item.properties.first_name.rich_text[0].plain_text } { item.properties.last_name.rich_text[0].plain_text }</p>
                        <p className = "meta">{ item.properties.position.rich_text[0].plain_text }</p>
                        <Link to = {`/player/${item.id}`}>Link</Link>
                    </div>
                </div>
              </div>
          ) )}
        </div>     

      </div>
    );
}
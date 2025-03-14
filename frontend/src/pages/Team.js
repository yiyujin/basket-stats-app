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

      // if(players){
      //   console.log("asd",players)
      // }

      setLoading(false);
    }, [data]);

    return (
      <div className = "page">

        <div className = "banner">
          <div className = "img-banner-container">
            <img className = "img-banner" src = "https://seeklogo.com/images/T/toronto-raptors-logo-456EE558CF-seeklogo.com.png"/>
          </div>
          
          <div className = "banner-text">
            <h1>{ data && data.Name?.title[0]?.plain_text }</h1>
            <p>{ players.length } members  ·  New York  ·  Since 2022</p>
          </div>
        </div>

        
        <div style = { { display : "flex", flexDirection : "row", gap : "8px" } }>
          
          <div className = "dashboard-nav-container">
            <h3 className = "dashboard-nav">Players</h3>
            <h3 className = "dashboard-nav">Highlights</h3>
          </div>

          <div style = { { flex : 1 } }>
            { players.map( ( item, index) => (
              <Link key = { index } to = {`/player/${item.id}`}>
              <div style = { { display : "flex", flexDirection : "row", height : "80px", alignItems : "center", gap : "8px", backgroundColor : "var(--black4)", padding : "8px", marginBottom : "16px"} }>
                <div className = "icon-container">
                  <img className = "icon" src = { iconMap[item.properties.position.rich_text[0].plain_text] || icons[3].url }/>
                </div>

                <div className = "icon-container">
                  <p className = "number" style = { { height : "100%", textAlign : "center" } }>{ item.properties.back_number.rich_text[0].plain_text}</p>
                </div>
              
          
                <h2>{ item.properties.first_name.rich_text[0].plain_text } { item.properties.last_name.rich_text[0].plain_text }</h2>
                <p className = "meta">{ item.properties.position.rich_text[0].plain_text }</p>
                
              </div>
              </Link>
            ) )}
          </div>     

        </div>

      </div>
    );
}
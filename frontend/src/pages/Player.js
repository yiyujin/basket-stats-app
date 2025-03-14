import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export default function Player(){
    const { id } = useParams();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
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
    
        const result = await response.json();

        console.log(result.properties);
        setData(result.properties);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
      
    useEffect(() => {
    fetchData(id);
    }, []);

    return(
      <div className = "page">
        <div className = "player-banner">
          <div>
            <Link to = { `/team/${data.Teams?.relation[0].id}`} >{ data && data.Rollup?.rollup.array[0].title[0].plain_text }</Link>

            { data && data.back_number?.rich_text[0].plain_text }  ·  { data && data.position?.rich_text[0].plain_text }
            
            </div>
          <h1>{ data && data.Name?.title[0].plain_text }</h1>
        </div>
      </div>
    )
}
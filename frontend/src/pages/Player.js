import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Player(){
    const { id } = useParams();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async ( id ) => {    
        // console.log('sending', id);
    
        try {
          const response = await fetch(`http://localhost:8000/api/query-a-database-players`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify( { id : id } ),
          });
      
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
      
          const result = await response.json();
          setData(result);
        } catch (error) {
          console.error("Error fetching data:", error.message);
        }
    };
      
    useEffect(() => {
    fetchData(id);
    }, []);

    return(
        <div className = "page">

        </div>
    )
}
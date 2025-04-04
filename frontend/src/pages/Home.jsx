import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Home(){
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try{
      const response = await fetch("http://localhost:8000/api/query-a-database-teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    fetchData();
  }, []);

  return(
    <div className = "page">
        <h2>Registered Teams ({ data.length }) :</h2>
        
        { data.map( ( item ) => (
            <div key = { item.id }>
                <Link to = { `/team/${ item.id }` }>{ item.properties.Name.title[0].plain_text }</Link>
            </div>
        ))}
    </div>
  )
}
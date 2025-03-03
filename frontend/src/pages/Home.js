import { useState, useEffect } from "react";

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

      console.log(result);
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

    return(
        <div>
            <h1>Basket Stats</h1>
            
            <p>Teams : </p>
            { data.map( ( item ) => (
                <p key = { item.id }>{ item.properties.name.title[0].plain_text }</p>
            ))}
        </div>
    )
}
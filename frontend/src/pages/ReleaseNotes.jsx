import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";

export default function ReleaseNotes(){
    const [loading, setLoading] = useState(true);

    const [data,setData] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);

// FETCH CONTENTS
const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/retrieve-block-children`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log(responseData);
      setData(responseData.results);
      setHasMore(responseData.has_more);
      setNextCursor(responseData.next_cursor);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  // Function to fetch additional data (pagination)
  const fetchDataPagination = async (startCursor = null) => {
    try {
      let url = `http://localhost:8000/api/retrieve-block-children`;

      // If there's a cursor, append it to the URL as a query parameter
      if (startCursor) {
        url += `&start_cursor=${startCursor}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();

      // Append new data to existing data
      setData((prevData) => [...prevData, ...responseData.results]);
      setHasMore(responseData.has_more);
      setNextCursor(responseData.next_cursor);
    } catch (error) {
      console.error("Error fetching additional data:", error.message);
    }
  };

  useEffect( () => {
    fetchData();
  }, []);

    return (
        <>
            { loading ? <Loading/> :
                <div className = "page">
                    { data.map( ( item, index ) => (
                        <div key = { item.id }>
                            <div className = "meta3" style = { { display : "flex", flexDirection : "row", gap : "40px", alignItems : "center" } }>
                            
                                <p className = "meta3" style = { { width : "8px", color : "var(--black16)" } }>{ index % 8 === 0 ? index : "-" }</p>

                                { item.type === "paragraph" && (
                                    <div>
                                        { item[item.type]?.rich_text?.length === 0 ? ( 
                                        <br /> 
                                        ) : item[item.type]?.rich_text?.[0]?.href ? (
                                        <a target="_blank" href={item[item.type]?.rich_text?.[0]?.href}>
                                            {item[item.type]?.rich_text?.[0]?.href}
                                        </a>
                                        ) : (
                                        <p
                                            style = {{
                                            color:
                                                item[item.type]?.color === "black"
                                                ? "black"
                                                : item[item.type]?.color === "blue"
                                                ? "blue"
                                                : "inherit", // Default color
                                            }}
                                        >
                                            { item[item.type]?.rich_text?.[0]?.plain_text }
                                        </p>
                                        )}
                                    </div>
                                )}

                                { item.type === "heading_2" && (
                                    <h2>{item[item.type]?.rich_text[0]?.plain_text}</h2> 
                                )}

                                { item.type === "heading_3" && (
                                    <h3>{item[item.type]?.rich_text[0]?.plain_text}</h3> 
                                )}

                                {item.type === "bulleted_list_item" && (
                                    <div className = "bullet">
                                        <p className = "emoji">🏀</p>
                                        <p>{ item[item.type].rich_text[0].plain_text }</p>
                                    </div>
                                )}

                                {item.type === "image" && (
                                    <div>
                                        <img src = { item[item.type].file ? item[item.type].file.url : "" } alt = "Page Image" />
                                        <h3 className = "caption">{ item[item.type].caption[0]?.plain_text }</h3>
                                    </div>
                                )}

                                {item.type === "video" && (
                                     <div style = { { width : "100%", display : "flex", alignItems : "center", justifyContent : "center" } }>
                                        <video controls><source src =  { item[item.type].file.url } type = "video/mp4"/></video>
                                        <h3 className = "caption">{ item[item.type].caption[0]?.plain_text }</h3>
                                    </div>
                                )}

                                {item.type === "divider" && <hr />}

                                { item.type === "code" && (
                                    <SourceCodeComponent data = {item[item.type]}/>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            }
        </>
    );
}
export default function Player(){

    const data = [
        {
            title : "Tony's 3pt Play",
            players : "Tony, DBK, DO",
            scorer : "Tony",
            link : "https://file.notion.so/f/f/e03c720f-f008-4075-a4d9-2cd311c55b1d/4714ce3a-2da4-4037-93f0-74a2ccfc9243/610c0748-9e07-4ac2-8e53-ba01448c9815.mp4?table=block&id=1a7afaf7-b684-80b1-aad1-f426b82c553e&spaceId=e03c720f-f008-4075-a4d9-2cd311c55b1d&expirationTimestamp=1741046400000&signature=bKskUub1L2tzdcojLJs-D6isudqo4Uss8wf3yS03EuQ&downloadName=610c0748-9e07-4ac2-8e53-ba01448c9815.mp4"
        },
        {
            title : "Tony's 2pt Play",
            players : "Tony, DBK, Rob",
            scorer : "Tony",
            link : "https://file.notion.so/f/f/e03c720f-f008-4075-a4d9-2cd311c55b1d/f84a2155-fbdc-4f2e-9a4c-ebe794b5d7b3/1ff855a5-2b00-4dae-acbe-94f25ab4e0c1.mp4?table=block&id=1a7afaf7-b684-8040-b0dd-f85a7d2ccd53&spaceId=e03c720f-f008-4075-a4d9-2cd311c55b1d&expirationTimestamp=1741039200000&signature=439dgPUsSgOv0TyyZeYeMSrjvWwzDA85PnmPxq6ETPE&downloadName=1ff855a5-2b00-4dae-acbe-94f25ab4e0c1.mp4"
        },
        {
            title : "Tony's Steal",
            players : "Tony, Rob",
            scorer : "Tony",
            link : "https://file.notion.so/f/f/e03c720f-f008-4075-a4d9-2cd311c55b1d/fcac8d72-2ad8-46d7-abcc-e541221a1e65/ac7078f8-4b78-4cf7-8760-3cefca17cb57.mp4?table=block&id=1a8afaf7-b684-80be-9e8c-ef301d64acdc&spaceId=e03c720f-f008-4075-a4d9-2cd311c55b1d&expirationTimestamp=1741039200000&signature=EPR_w0VdvtXeDqDsUWBbSj9tNaAEArcEcC_aPmIZrdA&downloadName=ac7078f8-4b78-4cf7-8760-3cefca17cb57.mp4"
        },
        {
            title : "Tony's 2pt Play",
            players : "Tony, Rob",
            scorer : "Tony",
            link : "https://file.notion.so/f/f/e03c720f-f008-4075-a4d9-2cd311c55b1d/0baf2931-049b-4bf4-8b37-6ddfe2b601d3/4a171bca-f59a-4bc1-91d7-cd2f03cd2c76.mp4?table=block&id=1a8afaf7-b684-801d-bf4e-f27d50220f5a&spaceId=e03c720f-f008-4075-a4d9-2cd311c55b1d&expirationTimestamp=1741039200000&signature=tV5BzM2VYo_M4UrSBXPB8VkPnJD1XM_ZJIsPIMkrQd8&downloadName=4a171bca-f59a-4bc1-91d7-cd2f03cd2c76.mp4"
        },
        {
            title : "Tony's 2pt Play",
            players : "Tony",
            scorer : "Tony",
            link : "https://file.notion.so/f/f/e03c720f-f008-4075-a4d9-2cd311c55b1d/3709d73f-2471-48bb-9f0d-9ac68a18685c/73b7e8ba-9829-4524-a120-1675ab97b0f9.mp4?table=block&id=1a8afaf7-b684-807d-a9cf-e188968ccfe8&spaceId=e03c720f-f008-4075-a4d9-2cd311c55b1d&expirationTimestamp=1741039200000&signature=55j2zG0jRXhjl3abiPphVdF4EHVCtRmi2TmKAxCLpK4&downloadName=73b7e8ba-9829-4524-a120-1675ab97b0f9.mp4"
        }
    ]

    const data2 = [
        {
            link : process.env.PUBLIC_URL + '/graphics/0.jpg'
        },
        {
            link : process.env.PUBLIC_URL + '/graphics/1.jpg'
        },
        {
            link : process.env.PUBLIC_URL + '/graphics/2.jpg'
        },
        {
            link : process.env.PUBLIC_URL + '/graphics/3.jpg'
        },
        {
            link : process.env.PUBLIC_URL + '/graphics/4.jpg'
        },
        {
            link : process.env.PUBLIC_URL + '/graphics/5.jpg'
        },
    ]
    return(
        <div className = "page">
            <div className = "player-banner">
                <div>
                    <p>NYC Hoops  ·  #15  ·  Point-Guard</p>
                    <h1>Tony Lim</h1>
                </div>
            </div>

            <div className = "page-contents">
                {/* STATS */}
                <h2 className = "player-title">Stats</h2>
                <p>Games Played : 4</p>
                <p>Field Goal % : 40%</p>

                <hr/>
                
                {/* HIGHLIGHTS */}
                <div style = { { display : "flex", flexDirection : "row" } }>
                    <h2 className = "player-title">Highlights</h2>
                    <button>Generate Reels</button>
                </div>

                <br/>

                <div className = "grid-container">
                    { data.map( ( item, index ) => (
                        <div key = { index } className = "grid-item">
                            <video controls>
                                <source src = { item.link } type="video/mp4" />
                            </video>

                            <div className = "highlight-text">
                                <h3>{ item.title }</h3>
                                <p className = "meta">{ item.players }</p>
                                <p></p>
                            </div>
                        </div>
                    ) )}
                </div>

                <hr/>
                
                {/* GENERATIVE GRAPHICS */}
                <div style = { { display : "flex", flexDirection : "row" } }>
                    <h2 className = "player-title">Generative Graphics</h2>
                    <button>Generate Graphics</button>
                </div>

                <br/>

                <div className = "grid-container">
                    { data2.map( ( item, index ) => (
                        <div key = { index } className = "grid-item">
                            <img src = { item.link }/>
                        
                        </div>
                    ) )}
                </div>
            </div>

        </div>
    )
}
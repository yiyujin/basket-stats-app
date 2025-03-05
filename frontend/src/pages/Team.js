export default function Team(){
    const data = [
        {
            name : "Tony",
            position : "Guard",
            team : "NYC Hoops",
            first_name : "Hyo-woon",
            last_name : "Lim",
            back_number : "4",
        },
        {
            name : "DBK",
            position : "Forward",
            team : "NYC Hoops",
            first_name : "Dong-bin",
            last_name : "Kim",
            back_number : "10",
        },
        {
            name : "Rob",
            position : "Center",
            team : "NYC Hoops",
            first_name : "Rob",
            last_name : "R",
            back_number : "5",
        },
        {
            name : "Bin",
            position : "Forward",
            team : "NYC Hoops",
            first_name : "B",
            last_name : "Bin",
            back_number : "11",
        },
        {
            name : "Oh",
            position : "Center",
            team : "NYC Hoops",
            first_name : "Eu-seok",
            last_name : "Oh",
            back_number : "32",
        },
        {
            name : "Jay",
            position : "Guard",
            team : "NYC Hoops",
            first_name : "Jin-young",
            last_name : "Lee",
            back_number : "2",
        },
        {
            name : "TJ",
            position : "Forward",
            team : "NYC Hoops",
            first_name : "Tae-joon",
            last_name : "Park",
            back_number : "18",
        },
        {
            name : "GW",
            position : "Forward",
            team : "NYC Hoops",
            first_name : "Geon-woo",
            last_name : "K",
            back_number : "14",
        },
        {
            name : "Yeon",
            position : "Forward",
            team : "NYC Hoops",
            first_name : "Yeon",
            last_name : "Choi",
            back_number : "23",
        },
    ]

    const icons = [
        {
            name : "Forward",
            url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJHsPV3l1kHS1wiqQ8jrzsBQo4iOAlpqsHzQ&s",
        },
        {
            name : "Center",
            url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScb0MARSnN12orbWvqNA17hMjw-uPCdJOl3g&s",
        },
        {
            name : "Guard",
            url : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFZeyh52YNkVK9p3QwNWCAKUzS52fPhRPq3Q&s",
        },
    ];

    const highlights = [
        {
            title : "Tony's 3pt Play",
            players : "Tony, DBK, DO",
            scorer : "Tony",
            link : "https://www.youtube.com/embed/jfgWojrwE74?si=8Dha-oIF4lXlbRcJ"
        },
        {
            title : "DBK's 2pt Play",
            players : "Tony, DBK, Rob",
            scorer : "Tony",
            link : "https://file.notion.so/f/f/e03c720f-f008-4075-a4d9-2cd311c55b1d/f84a2155-fbdc-4f2e-9a4c-ebe794b5d7b3/1ff855a5-2b00-4dae-acbe-94f25ab4e0c1.mp4?table=block&id=1a7afaf7-b684-8040-b0dd-f85a7d2ccd53&spaceId=e03c720f-f008-4075-a4d9-2cd311c55b1d&expirationTimestamp=1741039200000&signature=439dgPUsSgOv0TyyZeYeMSrjvWwzDA85PnmPxq6ETPE&downloadName=1ff855a5-2b00-4dae-acbe-94f25ab4e0c1.mp4"
        },
        {
            title : "Rob's Steal",
            players : "Tony, Rob",
            scorer : "Tony",
            link : "https://file.notion.so/f/f/e03c720f-f008-4075-a4d9-2cd311c55b1d/fcac8d72-2ad8-46d7-abcc-e541221a1e65/ac7078f8-4b78-4cf7-8760-3cefca17cb57.mp4?table=block&id=1a8afaf7-b684-80be-9e8c-ef301d64acdc&spaceId=e03c720f-f008-4075-a4d9-2cd311c55b1d&expirationTimestamp=1741039200000&signature=EPR_w0VdvtXeDqDsUWBbSj9tNaAEArcEcC_aPmIZrdA&downloadName=ac7078f8-4b78-4cf7-8760-3cefca17cb57.mp4"
        },
        {
            title : "Rob's Dunk",
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

    const iconMap = {
        "Guard": icons[0].url,
        "Forward": icons[1].url,
        "Center": icons[2].url
      };


    return(
        <div className = "page">
            <div className = "player-banner">
                <div>
                    <p>{ data.length } members  ·  New York  ·  Since 2022</p>
                    <h1>NYC Hoops</h1>
                </div>
            </div>

            <br/>

            <div style = { { margin : "40px" } }>

                {/* TEAM PLAYERS */}

                <h2>Team Stats</h2>
                <p>Games played : 94</p>


                <hr/>

                <h2>Highlights</h2>

                <div className = "grid-container">
                    { highlights.map( ( item, index) => (
                            <div key = { index } className = "grid-item">
                                

                                <div className = "highlight-container">
                                    <img src = { process.env.PUBLIC_URL + '/graphics/thumbnail.png' }/>

                                    <img className = "highlight-thumbnail" src = "https://i.namu.wiki/i/FJgVhMvYkDgVdPfiENuaEtgJo11sef1SpxP4jx6lmMXMQ43bgmkxR3IlmdzPKqk91V4E_zoP0pF4RWhx-qcS-Q.webp"/>
                                </div>



                                <div className = "highlight-text">
                                    <h3>{ item.title }</h3>
                                    <p className = "meta">{ item.players }</p>
                                </div>
                            </div>
                        ) )}
                </div>


                <hr/>

                <h2>Players</h2>
            
                <select>
                    <option value = "Played Most Games">Played Most Games</option>
                    <option value = "Options">Options</option>
                    <option value = "Options">Options</option>
                    <option value = "Options">Options</option>
                </select>

                <div className = "grid-container">
                    { data.map( ( item, index) => (
                        <div key = { index } className = "grid-item">
                            <img className = "profile-image" height = "200px" src = "https://i.namu.wiki/i/FJgVhMvYkDgVdPfiENuaEtgJo11sef1SpxP4jx6lmMXMQ43bgmkxR3IlmdzPKqk91V4E_zoP0pF4RWhx-qcS-Q.webp"/>
                            
                            <div style = { { display : "flex", flexDirection : "row" } }>
                                <img className = "icon" src={iconMap[item.position] || icons[3].url}/>
                                <h1 style = { { fontFamily : "var(--font-Barlow)"} }>{ item.back_number }</h1>
                                <div>
                                    <h3>{ item.name }</h3>
                                    <p className = "meta">{ item.first_name } { item.last_name }</p>
                                    <p className = "meta">{ item.position }</p>
                                </div>
                            </div>

                        </div>
                    ) )}
                </div>                
            </div>
        </div>
    )
}
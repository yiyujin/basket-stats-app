import VideoModal from "../components/VideoModal";

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
            title : "DBK's 3pt Play",
            players : "DBK, DO",
            scorer : "DBK",
            video_id : "jfgWojrwE74",
            link : "https://www.youtube.com/embed/jfgWojrwE74?si=8Dha-oIF4lXlbRcJ"
        },
        {
            title : "DBK's 2pt Play",
            players : "DBK, Rob",
            scorer : "DBK",
            video_id : "s-IwazC6GXw",
            link : "https://www.youtube.com/embed/s-IwazC6GXw?si=PQavN-WZl5_KOWlz"
        },
        {
            title : "DBK's Steal",
            players : "DBK",
            scorer : "DBK",
            video_id : "LsLTfRKGfno",
            link : "https://www.youtube.com/embed/LsLTfRKGfno?si=KMON-mUNmTE3BXda"
        },
        {
            title : "DBK's 2pt Play",
            players : "DBK, Rob",
            scorer : "DBK",
            video_id : "X8fe76BYjkk",
            link : "https://www.youtube.com/embed/X8fe76BYjkk?si=Ng7O3QD1-LfgqHQZ"
        },
        {
            title : "DBK's 2pt Play",
            players : "DBK, Rob",
            scorer : "DBK",
            video_id : "7ftWRDfKXmg",
            link : "https://www.youtube.com/embed/X8fe76BYjkk?si=Ng7O3QD1-LfgqHQZ"
        },
        {
            title : "DBK's 2pt Play",
            players : "DBK",
            scorer : "DBK",
            video_id: "91MrognEtf4",
            link : "https://www.youtube.com/embed/7ftWRDfKXmg?si=45lIMOAdqInXCmIh"
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
                                    {/* <img src = { process.env.PUBLIC_URL + '/graphics/thumbnail.png' }/> */}
                                    <VideoModal videoId = { item.video_id }/>

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
export default function Player(){

    const data = [
        {
            title : "DBK's 3pt Play",
            players : "DBK, DO",
            scorer : "DBK",
            link : "https://www.youtube.com/embed/jfgWojrwE74?si=8Dha-oIF4lXlbRcJ"
        },
        {
            title : "DBK's 2pt Play",
            players : "DBK, Rob",
            scorer : "DBK",
            link : "https://www.youtube.com/embed/s-IwazC6GXw?si=PQavN-WZl5_KOWlz"
        },
        {
            title : "DBK's Steal",
            players : "DBK",
            scorer : "DBK",
            link : "https://www.youtube.com/embed/LsLTfRKGfno?si=KMON-mUNmTE3BXda"
        },
        {
            title : "DBK's 2pt Play",
            players : "DBK, Rob",
            scorer : "DBK",
            link : "https://www.youtube.com/embed/X8fe76BYjkk?si=Ng7O3QD1-LfgqHQZ"
        },
        {
            title : "DBK's 2pt Play",
            players : "DBK",
            scorer : "DBK",
            link : "https://www.youtube.com/embed/7ftWRDfKXmg?si=45lIMOAdqInXCmIh"
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
                    <p>NYC Hoops  ·  #15  ·  Forward</p>
                    <h1>DBK</h1>
                </div>
            </div>

            <div className = "page-contents">
                {/* STATS */}
                <h2 className = "player-title">Stats</h2>
                <p>Games Played : 4</p>
                <p>Field Goal % : 40%</p>

                <hr/>
                
                {/* HIGHLIGHTS */}
                <div style = { { display : "flex", flexDirection : "row", gap : "16px" } }>
                    <h2 className = "player-title">Highlights</h2>
                    <button>Generate Reels</button>
                    <select>
                        <option value = "Most Recent">Most Recent</option>
                        <option value = "Most Recent">Most Recent</option>
                        <option value = "Most Recent">Most Recent</option>
                    </select>
                </div>

                <br/>

                <div className = "grid-container">
                    { data.map( ( item, index ) => (
                        <div key = { index } className = "grid-item">
                            {/* <video controls>
                                <source src = { item.link } type="video/mp4" />
                            </video> */}

                            <iframe src = { item.link } frameborder = "0" allowFullScreen></iframe>

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
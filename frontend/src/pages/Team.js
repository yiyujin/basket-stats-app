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

    const iconMap = {
        "Guard": icons[0].url,
        "Forward": icons[1].url,
        "Center": icons[2].url
      };


    return(
        <div className = "page">
            <div>
                <div className = "player-banner">
                    <div>
                        <p>{ data.length } members  ·  New York  ·  Since 2022</p>
                        <h1>NYC Hoops</h1>
                    </div>
                </div>

                <br/>

                {/* TEAM PLAYERS */}

                <h1>Games</h1>


                <hr/>

                <h1>Highlights</h1>


                <hr/>

                <h1>Players</h1>
            
                <select>
                    <option value = "Played Most Games">Played Most Games</option>
                    <option value = "Options">Options</option>
                    <option value = "Options">Options</option>
                    <option value = "Options">Options</option>
                </select>

                <div className = "grid-container">
                    { data.map( ( item, index) => (
                        <div key = { index } className = "grid-item">
                            <img height = "200px" src = "https://i.namu.wiki/i/FJgVhMvYkDgVdPfiENuaEtgJo11sef1SpxP4jx6lmMXMQ43bgmkxR3IlmdzPKqk91V4E_zoP0pF4RWhx-qcS-Q.webp"/>
                            
                            <div style = { { display : "flex", flexDirection : "row" } }>
                                <img className = "icon" src={iconMap[item.position] || icons[3].url}/>
                                <h1 style = { { fontFamily : "var(--font-Barlow)"} }>{ item.back_number }</h1>
                                <div>
                                    <h3>{ item.name }</h3>
                                    <p className = "meta">{ item.first_name } { item.last_name }</p>
                                    <p className = "meta">{ item.position }</p>
                                </div>
                            </div>

                            <div style = { { display: "flex", flexDirection: "row", width : "33%", gap : "2px", padding : "8px" } }>
                                <img src="https://play-lh.googleusercontent.com/BKV-PMF7fbH5bB8HR7T3D5JAj4GycI2G-K94HzvybXDnBkeFxmKnAt5YZvC8dQdgWQ=w526-h296-rw"/>
                                <img src="https://play-lh.googleusercontent.com/BKV-PMF7fbH5bB8HR7T3D5JAj4GycI2G-K94HzvybXDnBkeFxmKnAt5YZvC8dQdgWQ=w526-h296-rw"/>
                                <img src="https://play-lh.googleusercontent.com/BKV-PMF7fbH5bB8HR7T3D5JAj4GycI2G-K94HzvybXDnBkeFxmKnAt5YZvC8dQdgWQ=w526-h296-rw"/>
                            </div>

                        </div>
                    ) )}
                </div>
                
            </div>
        </div>
    )
}
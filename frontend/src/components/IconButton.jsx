import Button from '@mui/material/Button';

export default function IconButton( { icon : Icon } ){
    return(
        // <div className = "icon-container">
        //     <img className = "icon" src = { iconMap[item.properties.position.rich_text[0].plain_text] || icons[3].url }/>
        // </div>

        <div className = "icon-button">
            <Icon fontSize = "24px"/>
        </div>
    )
}
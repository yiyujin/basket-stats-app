import './App.css';
import { Routes, Route, useLocation } from "react-router-dom";
import Twemoji from 'react-twemoji';

// COMPONENTS
import Nav from './components/Nav';

// PAGES
import Home from './pages/Home';
import Login from './pages/Login';
import Player from './pages/Player';
import Team from './pages/Team';
import Game from './pages/Game';
import ReleaseNotes from './pages/ReleaseNotes';
import About from './pages/About';

export default function App (){
  const location = useLocation();

  return(
    <Twemoji options = { { className: 'twemoji' } } key = { location.pathname }>
      <div className = "App">
        <Nav/>

        <Routes> 
          <Route path = "/login" element = { <Login/>}/>
          <Route path = "/" element = { <Home/>}/>
          <Route path = "/player/:id" element = { <Player/>}/>
          <Route path = "/team/:id" element = { <Team/>}/>
          <Route path = "/game" element = { <Game/>}/>
          <Route path = "/about" element = { <About/>}/>
          <Route path = "/releasenotes" element = { <ReleaseNotes/>}/>
        </Routes>
      </div>
    </Twemoji>
  )
}
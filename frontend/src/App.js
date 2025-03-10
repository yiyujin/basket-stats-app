import './App.css';
import { Routes, Route } from "react-router-dom";

// COMPONENTS
import Nav from './components/Nav';

// PAGES
import Home from './pages/Home';
import Login from './pages/Login';
import Player from './pages/Player';
import Team from './pages/Team';

export default function App() {
  return (
    <div className = "App">

      <Nav/>
    <Routes>
      <Route path = "/login" element = { <Login/>}/>
      <Route path = "/" element = { <Home/>}/>
      {/* <Route path = "/player:id" element = { <Player/>}/> */}
      <Route path = "/player" element = { <Player/>}/>
      <Route path = "/team" element = { <Team/>}/>
    </Routes>
    </div>
  );
}
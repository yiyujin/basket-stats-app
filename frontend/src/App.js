import './App.css';
import { Routes, Route } from "react-router-dom";

// PAGES
import Home from './pages/Home';
import Player from './pages/Player';
import Login from './pages/Login';

export default function App() {
  return (
    <div className = "App">
    <Routes>
      <Route path = "/login" element = { <Login/>}/>
      <Route path = "/" element = { <Home/>}/>
      {/* <Route path = "/player:id" element = { <Player/>}/> */}
      <Route path = "/player" element = { <Player/>}/>
    </Routes>
    </div>
  );
}
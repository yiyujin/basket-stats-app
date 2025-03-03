import './App.css';
import { Routes, Route } from "react-router-dom";

// PAGES
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  return (
    <div className = "App">
    <Routes>
      <Route path = "/login" element = { <Login/>}/>
      <Route path = "/" element = { <Home/>}/>
      <Route path = "/dashboard:id" element = { <Dashboard/>}/>
    </Routes>
    </div>
  );
}
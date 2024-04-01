import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Meetings from "./pages/Meetings";
import Notification from "./pages/Notification"; 
import "./style.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/notifications" element={<Notification />} />
      </Routes>
    </Router>
  );
}

export default App;

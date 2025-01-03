import React from "react";
import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Tokens from "./components/Tokens";
import { Routes, Route } from "react-router-dom";

function App() {
  const [isConnected, setIsConnected] = React.useState(true);
  return <div className="App">      
  <Header connect={true} isConnected={isConnected} address={'0x8bvI9N4830jfSDN844J3dJ42e28'} />
  <div className="mainWindow">
    <Routes>
      <Route path="/" element={<Swap isConnected={isConnected} address={'0x8bvI9N4830jfSDN844J3dJ42e28'} />} />
      <Route path="/tokens" element={<Tokens />} />
    </Routes>
  </div></div>;
}

export default App;

import React from "react";
import "./App.css";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Tokens from "./components/Tokens";
import WagmiWrapper from './components/WagmiWrapper'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { WagmiProvider } from 'wagmi'
import { config } from './config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 2. Set up a React Query client.
const queryClient = new QueryClient()

function App() {
  return <WagmiProvider config={config}>
  <QueryClientProvider client={queryClient}>
  <BrowserRouter>
  <WagmiWrapper>
  {({ handleConnectWallet, isConnected, address }) => (
  <div className="App">      
  <Header handleConnectWallet={handleConnectWallet} isConnected={isConnected} address={address} />
  <div className="mainWindow">
    <Routes>
      <Route path="/" element={<Swap isConnected={isConnected} address={address} />} />
      <Route path="/tokens" element={<Tokens />} />
    </Routes>
  </div></div>)}
  </WagmiWrapper>
  </BrowserRouter>
  </QueryClientProvider>
  </WagmiProvider>;
}

export default App;

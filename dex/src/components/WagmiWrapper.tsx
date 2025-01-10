import React, { ReactNode, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors'

// This component will use wagmi hooks and provide the values to its children
interface WagmiWrapperProps {
  children: (props: { handleConnectWallet: () => void; isConnected: boolean; address: string | undefined }) => ReactNode;
}

const WagmiWrapper: React.FC<WagmiWrapperProps> = ({ children }) => {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect()
  const { isConnected, address } = useAccount();
  console.log(address)

  const handleConnectWallet: () => void = () =>{ 
    if (!isConnected){
      connect({ connector: injected()})
    }
    else disconnect() }

  useEffect(()=>{
    if(!isConnected){
    handleConnectWallet()
    }
  },[])

  return (
    <div>
      {children && children({
        handleConnectWallet,
        isConnected,
        address,
      })}
    </div>
  );
};

export default WagmiWrapper;

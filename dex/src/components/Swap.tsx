import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message, RadioChangeEvent } from "antd";
import tokenList from "../tokenList.json";
import axios from "axios";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
interface SwapProps {

  isConnected: boolean;

  address: string | undefined;

}



const Swap: React.FC<SwapProps> = ({ isConnected, address }) => {
  const MIN_SLIPPAGE = 0.1;
  const MAX_SLIPPAGE = 5.0;
  
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState<string | number>("");
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | null>(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState<{ ratio: number } | null>(null);

  const handleSlippageChange = (e:RadioChangeEvent) => {
    const slippage = parseFloat(e.target.value);
    setSlippage(Math.min(Math.max(MIN_SLIPPAGE,slippage),MAX_SLIPPAGE));
  }
  const changeAmount = (e : React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)||value<0){
      message.error("Please enter a valid amount");
      return
    }
    setTokenOneAmount(value);
    if(value && prices && prices.ratio > 0){
      setTokenTwoAmount((value * prices.ratio).toFixed(2))
    }else{
      setTokenTwoAmount(null);
    }
  }
  // async function fetchPrices(token1: string, token2: string) {
  //   const prices = await axios.get("http://localhost:3001/tokenPrice",{params:{addressOne:token1,addresTwo:token2}})
  //   console.log(prices);
  //   }

  async function fetchPrices(token1: string, token2: string) {
    try {
      const response = await axios.get("http://localhost:3001/tokenPrice", {
        params: { addressOne: token1, addressTwo: token2 },
      });
      
      setPrices({ ratio: response.data.ratio });
    } catch (error) {
      console.error("Error fetching token prices:", error);
      message.error("Failed to fetch prices");
    }
  }
    
  function fetchDexSwap() {}

  const switchTokens = () => {
    setPrices(null);
    setTokenOneAmount("");
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }
  const openModal = (asset: React.SetStateAction<number>)=> {
    setChangeToken(asset);
    setIsOpen(true);
  }

  const modifyToken = (i: number) => {

    if (changeToken === 1) {
      if (tokenTwo === tokenList[i]){
        message.error("Can't swap similar tokens");
      }
      else if(tokenOne === tokenList[i]){
        message.info("Selected the same token.Please select another token")
      }
      else{
        setPrices(null);
        setTokenOneAmount("");
        setTokenTwoAmount(null);
        setTokenOne(tokenList[i]);
        fetchPrices(tokenList[i].address, tokenTwo.address)
      }
    } 
    else {
      if(tokenOne === tokenList[i]){
        message.error("Can't swap similar tokens");
      }
      else if(tokenTwo === tokenList[i]){
        message.info("Selected the same token.Please select another token")
      }
      else{
        setPrices(null);
        setTokenOneAmount("");
        setTokenTwoAmount(null);
        setTokenTwo(tokenList[i]);
        fetchPrices(tokenOne.address, tokenList[i].address)
      }
    }
    setIsOpen(false);
  }

  useEffect(()=>{

    fetchPrices(tokenList[0].address, tokenList[1].address)

  }, [])

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />-
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={!prices}
          />
          <Input placeholder="0" value={tokenTwoAmount || ""} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        {/* <div className="swapButton" disabled={!tokenOneAmount} onClick={fetchDexSwap}>Swap</div> */}
        <button className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Swap</button>
      </div>
      </>
  );
}

export default Swap
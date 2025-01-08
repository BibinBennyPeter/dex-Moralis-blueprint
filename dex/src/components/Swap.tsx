import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message, RadioChangeEvent } from "antd";
import tokenList from "../tokenList.json";
import axios from "axios";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from 'viem';
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";

interface SwapProps {
  isConnected: boolean;
  address: string | undefined;
}

type TxDetailsType = {
  to?: `0x${string}` | null | undefined,
  data?: `0x${string}` | undefined,
  value?: bigint | undefined
}

const Swap: React.FC<SwapProps> = ({ isConnected, address }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState<string | number>("");
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | null>(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState<{ ratio: number } | null>(null);
  const [txDetails, setTxDetails] = useState<TxDetailsType>({
    to:null,
    data: undefined,
    value: undefined,
  }); 

  const {data, sendTransaction} = useSendTransaction();

  const handleSendTransaction =()=>sendTransaction({
        to: txDetails.to,
        data: txDetails.data,
        value: parseEther(String(txDetails.value)),
    })
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  })

  async function fetchDexSwap(){

    const allowance = await axios.get(
      `/api/swap/v6.0/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`)
  
    if(allowance.data.allowance === "0"){

      const approve = await axios.get(`/api/swap/v6.0/1/approve/transaction?tokenAddress=${tokenOne.address}`)

      setTxDetails(approve.data);
      console.log("not approved")
      return

    }

    const tx = await axios.get(
      `/api/swap/v6.0/1/swap?srcTokenAddress=${tokenOne.address}&dstTokenAddress=${tokenTwo.address}&dstAmount=${tokenOneAmount.toString().padEnd(tokenOne.decimals+tokenOneAmount.toString().length, '0')}&fromAddress=${address}&slippage=${slippage}`)

    let decimals = Number(`1E${tokenTwo.decimals}`)
    setTokenTwoAmount((Number(tx.data.dstTokenAmount)/decimals).toFixed(2));

    setTxDetails(tx.data.tx);
  
  }

  function handleSlippageChange(e: RadioChangeEvent) {
    setSlippage(e.target.value);
  }
  function changeAmount(e: { target: { value: React.SetStateAction<string | number>; }; }) {
    setTokenOneAmount(e.target.value);
    if(e.target.value && prices){
      setTokenTwoAmount((Number(e.target.value) * prices.ratio).toFixed(2));
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

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount("");
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }
  function openModal(asset: React.SetStateAction<number>) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i: number){
    setPrices(null);
    setTokenOneAmount("");
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address)
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address)
    }
    setIsOpen(false);
  }

  useEffect(()=>{

    fetchPrices(tokenList[0].address, tokenList[1].address)

  }, [])
  useEffect(()=>{

    if(txDetails.to && isConnected){
      handleSendTransaction();
    }
}, [txDetails])


useEffect(()=>{

  messageApi.destroy();

  if(isLoading){
    messageApi.open({
      type: 'loading',
      content: 'Transaction is Pending...',
      duration: 0,
    })
  }    

},[isLoading])


useEffect(()=>{
  messageApi.destroy();
  if(isSuccess){
    messageApi.open({
      type: 'success',
      content: 'Transaction Successful',
      duration: 1.5,
    })
  }else if(txDetails.to){
    messageApi.open({
      type: 'error',
      content: 'Transaction Failed',
      duration: 1.50,
    })
  }

},[isSuccess])

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
    {contextHolder}
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
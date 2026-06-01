import React, { createContext, useState, useCallback } from 'react'
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers'
import BugBountyABI from '../utils/BugBountyABI.json'

export const Web3Context = createContext()

const BUG_BOUNTY_ADDRESS = '0xD258851F8FFd678109161B32e7c6cBD0DCd6aB2C'

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [contract, setContract] = useState(null)

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask를 설치해주세요!')
        return
      }

      // 네트워크 변경
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }]
        })
      } catch (switchError) {
        if (switchError.code === 4902) {
          alert('Sepolia 네트워크를 MetaMask에 추가해주세요')
          return
        }
      }

      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const contract = new Contract(BUG_BOUNTY_ADDRESS, BugBountyABI, signer)

      setProvider(provider)
      setSigner(signer)
      setContract(contract)
      setAccount(accounts[0])
      setIsConnected(true)
    } catch (error) {
      console.error('지갑 연결 오류:', error)
      alert('지갑 연결에 실패했습니다')
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    setIsConnected(false)
  }, [])

  const getReadProvider = useCallback(() => {
    return new JsonRpcProvider('https://sepolia.drpc.org')
  }, [])

  const getReadContract = useCallback(() => {
    const readProvider = new JsonRpcProvider('https://sepolia.drpc.org')
    return new Contract(BUG_BOUNTY_ADDRESS, BugBountyABI, readProvider)
  }, [])

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        isConnected,
        contract,
        connectWallet,
        disconnectWallet,
        BUG_BOUNTY_ADDRESS,
        getReadContract,
        getReadProvider
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}
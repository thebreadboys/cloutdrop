export const BSC_CHAIN_ID = 56 // BSC Mainnet
export const BSC_RPC_URL = "https://bsc-dataseed.binance.org/"

export const BSC_CHAIN_CONFIG = {
  chainId: `0x${BSC_CHAIN_ID.toString(16)}`,
  chainName: 'Binance Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'bnb',
    decimals: 18,
  },
  rpcUrls: [BSC_RPC_URL],
  blockExplorerUrls: ['https://bscscan.com/'],
}

export const addBSCNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [BSC_CHAIN_CONFIG],
    })
    return true
  } catch (error) {
    console.error('Error adding BSC network:', error)
    return false
  }
} 
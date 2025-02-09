"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader2, Coins, Trophy, Users, Wallet, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { AirdropAnimation } from "@/components/airdrop-animation"
import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { ethers } from 'ethers'
import { Alchemy } from 'alchemy-sdk'

// Define custom networks since Alchemy doesn't support BSC
const NETWORKS = {
  SOL_MAINNET: 'mainnet-beta',
  BSC_MAINNET: 'bsc-mainnet'
} as const

const STEPS = [
  {
    title: "Token Information",
    description: "Enter your token's contract address to get started.",
  },
  {
    title: "Weight Distribution",
    description: "Adjust the weights for each participant group.",
  },
  {
    title: "Connect Wallet",
    description: "Connect your wallet to proceed with the airdrop setup.",
  },
  {
    title: "Confirm & Launch",
    description: "Review your airdrop details and launch.",
  },
]

// Replace the existing check
const DESTINATION_WALLET = process.env.NEXT_PUBLIC_DESTINATION_WALLET || ''

const RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana"
];

// Add BSC configuration
const BSC_RPC = "https://bsc-dataseed.binance.org/"
const BSC_CHAIN_ID = 56

// Add token ABI for BSC transfers
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
]

// Add chain icons and configuration
const CHAIN_CONFIG = {
  SOLANA: {
    name: 'Solana',
    icon: '/chains/solana.svg',
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  },
  BSC: {
    name: 'BNB Chain',
    icon: '/chains/bnb.svg',
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  }
} as const;

const getWorkingConnection = async (): Promise<Connection> => {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, {
        commitment: "finalized",
        confirmTransactionInitialTimeout: 60000
      });
      await connection.getLatestBlockhash();
      console.log(`Connected successfully to ${endpoint}`);
      return connection;
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}`);
      continue;
    }
  }
  throw new Error("Unable to connect to any Solana RPC endpoint");
};

// Update the detectTokenChain function
const detectTokenChain = async (contractAddress: string): Promise<'BSC' | 'SOLANA' | null> => {
  try {
    // Try to parse as Solana address
    const solPubKey = new PublicKey(contractAddress);
    // Verify if it's a valid Solana token
    const connection = await getWorkingConnection();
    const tokenInfo = await connection.getParsedAccountInfo(solPubKey);
    if (tokenInfo) return 'SOLANA';
  } catch (solError) {
    // Not a valid Solana address, try BSC
    try {
      if (!ethers.isAddress(contractAddress)) throw new Error("Invalid BSC address");
      
      // Create a provider to check if the contract exists
      const provider = new ethers.JsonRpcProvider(BSC_RPC);
      const code = await provider.getCode(contractAddress);
      
      // If the address has code, it's a contract
      if (code !== '0x') return 'BSC';

    } catch (bscError) {
      console.error("BSC validation error:", bscError);
    }
  }
  
  return null;
};

// Update the transferBSCTokens function with better error handling
const transferBSCTokens = async (
  contractAddress: string,
  amount: string,
  destinationAddress: string
): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask or similar wallet not found. Please install MetaMask to continue.");
    }

    // Connect to BSC
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Request chain switch if needed
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(BSC_CHAIN_ID)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${BSC_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${BSC_CHAIN_ID.toString(16)}`,
              chainName: 'Binance Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: [BSC_RPC],
              blockExplorerUrls: ['https://bscscan.com/']
            }]
          });
        } else {
          throw new Error("Failed to switch to BSC network. Please switch manually in MetaMask.");
        }
      }
    }

    // Setup contract with error handling
    const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
    let decimals;
    try {
      decimals = await tokenContract.decimals();
    } catch (error) {
      throw new Error("Failed to get token decimals. Make sure this is a valid BEP-20 token.");
    }

    const amountBigInt = ethers.parseUnits(amount, decimals);

    // Send transaction with proper error handling
    try {
      const tx = await tokenContract.transfer(destinationAddress, amountBigInt);
      const receipt = await tx.wait();
      
      if (!receipt.status) {
        throw new Error("Transaction failed. Please check your balance and try again.");
      }
      
      return true;
    } catch (error: any) {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Insufficient funds to complete the transaction.");
      }
      throw error;
    }
  } catch (error) {
    console.error("BSC transfer error:", error);
    throw error;
  }
};

// Add these helper functions after the transferBSCTokens function
const fetchSolanaTokenInfo = async (contractAddress: string) => {
  try {
    const connection = await getWorkingConnection();
    const mint = new PublicKey(contractAddress);
    
    // You can expand this to fetch more token info using Helius or other APIs
    return {
      name: "Solana Token", // Replace with actual token name fetch
      ticker: "SOL", // Replace with actual token ticker fetch
      exchangeRate: 0.01 // Replace with actual exchange rate fetch
    };
  } catch (error) {
    console.error("Error fetching Solana token info:", error);
    throw error;
  }
};

const fetchBSCTokenInfo = async (contractAddress: string) => {
  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const tokenContract = new ethers.Contract(
      contractAddress,
      [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        ...ERC20_ABI
      ],
      provider
    );

    const [name, symbol] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol()
    ]);

    // You can add price fetching logic here using BSC APIs
    return {
      name,
      ticker: symbol,
      exchangeRate: 0.01 // Replace with actual exchange rate fetch
    };
  } catch (error) {
    console.error("Error fetching BSC token info:", error);
    throw error;
  }
};

// Update the window.ethereum type declaration
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
    };
  }
}

export function LaunchForm() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    contractAddress: "",
    coinName: "",
    coinTicker: "",
    tokenAmount: "",
    usdAmount: "",
    weights: {
      influencer: 33,
      community: 33,
      whale: 34,
    },
  })
  const [isEnteringUsd, setIsEnteringUsd] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(0.01)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [isAirdropInProgress, setIsAirdropInProgress] = useState(false)
  const [isAirdropComplete, setIsAirdropComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chainType, setChainType] = useState<'BSC' | 'SOLANA' | null>(null)

  const { publicKey, connected, sendTransaction } = useWallet()
  const router = useRouter()

  const fetchTokenInfo = async (contractAddress: string) => {
    setIsLoading(true)
    try {
      const detectedChain = await detectTokenChain(contractAddress)
      if (!detectedChain) {
        throw new Error("Invalid token contract address")
      }
      
      setChainType(detectedChain)
      
      // Get token info based on chain
      const tokenInfo = detectedChain === 'SOLANA' 
        ? await fetchSolanaTokenInfo(contractAddress)
        : await fetchBSCTokenInfo(contractAddress)
      
      setExchangeRate(tokenInfo.exchangeRate)
      setIsValidated(true)
      return tokenInfo
    } catch (error) {
      console.error("Token fetch error:", error)
      setIsValidated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const convertAmount = (amount: string, fromUsd: boolean) => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return ""
    return fromUsd ? (numAmount / exchangeRate).toFixed(2) : (numAmount * exchangeRate).toFixed(2)
  }

  const updateFormData = async (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "contractAddress") {
      if (value.length > 0) {
        const tokenInfo = await fetchTokenInfo(value)
        setFormData((prev) => ({
          ...prev,
          coinName: tokenInfo.name,
          coinTicker: tokenInfo.ticker,
        }))
      } else {
        setIsValidated(false)
      }
    }

    if (field === "tokenAmount" || field === "usdAmount") {
      const otherField = field === "tokenAmount" ? "usdAmount" : "tokenAmount"
      const convertedAmount = convertAmount(value, field === "usdAmount")
      setFormData((prev) => ({ ...prev, [otherField]: convertedAmount }))
    }
  }

  const toggleInputMode = () => {
    setIsEnteringUsd(!isEnteringUsd)
    // Swap the values when toggling
    setFormData((prev) => ({
      ...prev,
      tokenAmount: prev.usdAmount,
      usdAmount: prev.tokenAmount,
    }))
  }

  const updateWeight = (type: "influencer" | "community" | "whale", newValue: number) => {
    setFormData((prev) => {
      const oldValue = prev.weights[type]
      const difference = newValue - oldValue
      const othersToUpdate = Object.keys(prev.weights).filter((k) => k !== type) as Array<
        "influencer" | "community" | "whale"
      >

      const newWeights = { ...prev.weights, [type]: newValue }

      othersToUpdate.forEach((key) => {
        newWeights[key] = Math.max(0, newWeights[key] - difference / 2)
      })

      // Ensure total is always 100
      const total = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0)
      if (total !== 100) {
        const adjust = (100 - total) / 3
        Object.keys(newWeights).forEach((key) => {
          newWeights[key as "influencer" | "community" | "whale"] += adjust
        })
      }

      // Round all values to integers
      Object.keys(newWeights).forEach((key) => {
        newWeights[key as "influencer" | "community" | "whale"] = Math.round(
          newWeights[key as "influencer" | "community" | "whale"],
        )
      })

      return { ...prev, weights: newWeights }
    })
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else if (step === STEPS.length - 1) {
      initiateAirdrop()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const transferTokens = async () => {
    if (!chainType) throw new Error("Chain type not detected")
    
    if (chainType === 'SOLANA') {
      return await transferSolanaTokens()
    } else {
      return await transferBSCTokens(
        formData.contractAddress,
        formData.tokenAmount,
        DESTINATION_WALLET
      )
    }
  }

  const transferSolanaTokens = async () => {
    try {
      if (!publicKey || !connected) {
        throw new Error("Wallet not connected")
      }

      if (!process.env.NEXT_PUBLIC_DESTINATION_WALLET) {
        throw new Error("Destination wallet address not configured")
      }

      if (!formData.contractAddress) {
        throw new Error("Token contract address is required")
      }

      if (!formData.tokenAmount || parseFloat(formData.tokenAmount) <= 0) {
        throw new Error("Invalid transfer amount")
      }

      console.log("Starting transfer with details:", {
        from: publicKey.toString(),
        to: process.env.NEXT_PUBLIC_DESTINATION_WALLET,
        tokenMint: formData.contractAddress,
        amount: formData.tokenAmount
      })

      // Get a working connection
      const connection = await getWorkingConnection();
      
      // Get the token mint from the contract address
      let mint;
      try {
        mint = new PublicKey(formData.contractAddress);
        console.log("Valid mint address:", mint.toString());
      } catch (error) {
        throw new Error(`Invalid token address: ${(error as Error).message}`);
      }

      // Validate destination wallet
      let destinationWallet;
      try {
        destinationWallet = new PublicKey(process.env.NEXT_PUBLIC_DESTINATION_WALLET);
        console.log("Valid destination wallet:", destinationWallet.toString());
      } catch (error) {
        throw new Error(`Invalid destination wallet: ${(error as Error).message}`);
      }

      // Get ATAs with error handling
      let senderATA, destinationATA;
      try {
        senderATA = await getAssociatedTokenAddress(mint, publicKey);
        console.log("Sender ATA:", senderATA.toString());
        
        // Check if sender ATA exists
        const senderAccount = await connection.getAccountInfo(senderATA);
        if (!senderAccount) {
          throw new Error("You don't have a token account for this token. Please create one first.");
        }

        destinationATA = await getAssociatedTokenAddress(mint, destinationWallet);
        console.log("Destination ATA:", destinationATA.toString());
        
        // Check if destination ATA exists
        const destAccount = await connection.getAccountInfo(destinationATA);
        if (!destAccount) {
          throw new Error("Destination token account doesn't exist. Please create it first.");
        }
      } catch (error) {
        console.error("ATA error details:", error);
        throw new Error(`Token account error: ${(error as Error).message}`);
      }

      // Create and send transaction with detailed error handling
      try {
        const transaction = new Transaction();
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const transferInstruction = createTransferInstruction(
          senderATA,
          destinationATA,
          publicKey,
          Math.round(parseFloat(formData.tokenAmount) * Math.pow(10, 9))
        );

        transaction.add(transferInstruction);
        
        console.log("Sending transaction...");
        const signature = await sendTransaction(transaction, connection);
        console.log("Transaction sent, signature:", signature);
        
        console.log("Confirming transaction...");
        await connection.confirmTransaction(signature, "confirmed");
        console.log("Transaction confirmed!");
        
        return true;
      } catch (error) {
        console.error("Transaction error details:", error);
        throw new Error(`Transaction failed: ${(error as Error).message}`);
      }
    } catch (error) {
      console.error("Full error details:", error);
      throw error;
    }
  }

  const initiateAirdrop = async () => {
    try {
      setError(null); // Clear any previous errors
      console.log("Starting airdrop process...");
      setIsAirdropInProgress(true);
      
      await transferTokens();
      
      await new Promise((resolve) => setTimeout(resolve, 5000));
      setIsAirdropInProgress(false);
      setIsAirdropComplete(true);
      
      setTimeout(() => {
        router.push("/analytics");
      }, 2000);
    } catch (error) {
      setIsAirdropInProgress(false);
      setIsAirdropComplete(false);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error("Airdrop failed:", errorMessage);
      setError(errorMessage);
      alert(`Airdrop failed: ${errorMessage}`);
    }
  }

  if (isAirdropInProgress) {
    return <AirdropAnimation />
  }

  if (isAirdropComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-2xl font-bold">Airdrop Complete!</h2>
        <p className="text-muted-foreground">Redirecting to analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Launch Your Airdrop</h1>
        <p className="text-muted-foreground">Complete the steps below to set up your airdrop campaign.</p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "h-10 w-10 rounded-full border-2 flex items-center justify-center",
                  step === i && "border-blue-500 bg-blue-500/10 text-blue-500",
                  step > i && "border-blue-500 bg-blue-500 text-white",
                  step < i && "border-muted-foreground/30 text-muted-foreground/30",
                )}
              >
                {i + 1}
              </div>
              <div className="mt-2 space-y-1 text-center">
                <p className={cn("text-sm font-medium", step >= i ? "text-foreground" : "text-muted-foreground/30")}>
                  {s.title}
                </p>
                <p className={cn("text-xs", step >= i ? "text-muted-foreground" : "text-muted-foreground/30")}>
                  {s.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <Card className="border-blue-500/20 shadow-md">
        <CardContent className="pt-6">
          {step === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contractAddress">Contract Address</Label>
                <div className="relative">
                  <Input
                    id="contractAddress"
                    placeholder="Enter the contract address"
                    value={formData.contractAddress}
                    onChange={(e) => updateFormData("contractAddress", e.target.value)}
                    className={isLoading ? "pr-10" : ""}
                  />
                  {isLoading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {isValidated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                          {formData.coinTicker.slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{formData.coinName}</h3>
                          <p className="text-sm text-muted-foreground">{formData.coinTicker}</p>
                        </div>
                      </div>
                      {chainType && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={chainType === 'SOLANA' ? CHAIN_CONFIG.SOLANA.icon : CHAIN_CONFIG.BSC.icon} 
                              alt={chainType === 'SOLANA' ? 'Solana' : 'BSC'} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className={cn(
                            "text-sm",
                            chainType === 'SOLANA' ? CHAIN_CONFIG.SOLANA.className : CHAIN_CONFIG.BSC.className
                          )}>
                            {chainType === 'SOLANA' ? 'Solana Chain' : 'BSC Chain'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tokenAmount" className="text-base font-medium">
                          Airdrop Amount
                        </Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{formData.coinTicker}</span>
                          <Switch checked={isEnteringUsd} onCheckedChange={toggleInputMode} />
                          <span className="text-sm font-medium">USD</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-grow">
                          <Input
                            id="tokenAmount"
                            placeholder={`Enter amount in ${isEnteringUsd ? "USD" : formData.coinTicker}`}
                            value={isEnteringUsd ? formData.usdAmount : formData.tokenAmount}
                            onChange={(e) =>
                              updateFormData(isEnteringUsd ? "usdAmount" : "tokenAmount", e.target.value)
                            }
                            className="pr-20"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm font-medium text-muted-foreground">
                              {isEnteringUsd ? "USD" : formData.coinTicker}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-right text-muted-foreground">
                        ≈ {isEnteringUsd ? formData.tokenAmount : formData.usdAmount}{" "}
                        {isEnteringUsd ? formData.coinTicker : "USD"}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              {["influencer", "community", "whale"].map((type) => (
                <div key={type} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {type === "influencer" && <Users className="h-4 w-4 text-blue-500" />}
                        {type === "community" && <Trophy className="h-4 w-4 text-blue-500" />}
                        {type === "whale" && <Coins className="h-4 w-4 text-blue-500" />}
                        <Label>{type.charAt(0).toUpperCase() + type.slice(1)} Weight</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {type === "influencer" && "Priority for social media influencers and KOLs"}
                        {type === "community" && "Priority for active community contributors"}
                        {type === "whale" && "Priority for large token holders"}
                      </p>
                    </div>
                    <span className="font-mono text-sm">
                      {formData.weights[type as keyof typeof formData.weights]}%
                    </span>
                  </div>
                  <Slider
                    value={[formData.weights[type as keyof typeof formData.weights]]}
                    onValueChange={(values: number[]) => updateWeight(type as "influencer" | "community" | "whale", values[0])}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Connect Your Wallet</h2>
                <p className="text-sm text-muted-foreground">Connect your wallet to proceed with the airdrop setup</p>
              </div>
              <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-600 !text-white" />
              {connected && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
                  <p className="font-semibold">Wallet Connected</p>
                  <p className="text-sm mt-1">Address: {publicKey?.toBase58()}</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Confirm Airdrop Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Token:</span>
                  <span>
                    {formData.coinName} ({formData.coinTicker})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>
                    {formData.tokenAmount} {formData.coinTicker} (≈ {formData.usdAmount} USD)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Distribution:</span>
                  <span>
                    Influencers: {formData.weights.influencer}% | Community: {formData.weights.community}% | Whales:{" "}
                    {formData.weights.whale}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Wallet:</span>
                  <span className="truncate max-w-[200px]">{publicKey?.toBase58()}</span>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-blue-500">What to expect next:</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Your airdrop will be processed and distributed to the selected groups.</li>
                  <li>This process may take a few minutes to complete.</li>
                  <li>You'll be redirected to an analytics page to track the progress and impact of your airdrop.</li>
                  <li>Make sure to keep this browser window open until the process is complete.</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
          className="border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={(step === 2 && !connected) || (step === 3 && !isValidated)}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
        >
          {step === STEPS.length - 1 ? "Launch Airdrop" : "Continue"}
        </Button>
      </div>
    </div>
  )
}


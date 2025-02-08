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

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY
if (!HELIUS_API_KEY) {
  throw new Error("HELIUS_API_KEY is not set")
}

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

export function LaunchForm() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    contractAddress: "",
    coinName: "",
    coinTicker: "",
    airdropAmount: "",
    solAmount: "",
    weights: {
      influencer: 33,
      community: 33,
      whale: 34,
    },
    image: "",
    description: "",
  })
  const [isEnteringSol, setIsEnteringSol] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(0.01)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [isAirdropInProgress, setIsAirdropInProgress] = useState(false)
  const [isAirdropComplete, setIsAirdropComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const { publicKey, connected } = useWallet()
  const router = useRouter()

  const fetchTokenInfo = async (contractAddress: string) => {
    setIsLoading(true)
    setErrorMessage("") // Reset error message
    try {
      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'my-id',
          method: 'getAsset',
          params: {
            id: contractAddress,
            displayOptions: {
              showFungible: true, // Return details about a fungible token
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Token not found")
      }

      const { result } = await response.json()
      const tokenInfo = {
        name: result.content?.metadata?.name || "Unknown",
        ticker: result.content?.metadata?.symbol || "N/A",
        description: result.content?.metadata?.description || "No description available",
        exchangeRate: result.token_info?.price_info?.price_per_token || 0, // Default to 0 if not available
        image: result.content?.files?.[0]?.uri || result.content?.links?.image || "", // Use the image URI
      }

      setExchangeRate(tokenInfo.exchangeRate)
      setIsValidated(true)
      return tokenInfo
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching token info:", err);
      setErrorMessage(err.message);
      setIsValidated(false);
    } finally {
      setIsLoading(false)
    }
  }

  const convertAmount = (amount: string, fromSol: boolean) => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return ""
    return fromSol ? (numAmount / exchangeRate).toFixed(2) : (numAmount * exchangeRate).toFixed(2)
  }

  const updateFormData = async (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "contractAddress") {
      if (value.length > 0) {
        const tokenInfo = await fetchTokenInfo(value)
        if (tokenInfo) {
          setFormData((prev) => ({
            ...prev,
            coinName: tokenInfo.name,
            coinTicker: tokenInfo.ticker,
            image: tokenInfo.image,
            description: tokenInfo.description,
          }))
        }
      } else {
        setIsValidated(false)
      }
    }

    if (field === "airdropAmount" || field === "solAmount") {
      const otherField = field === "airdropAmount" ? "solAmount" : "airdropAmount"
      const convertedAmount = convertAmount(value, field === "solAmount")
      setFormData((prev) => ({ ...prev, [otherField]: convertedAmount }))
    }
  }

  const toggleInputMode = () => {
    setIsEnteringSol(!isEnteringSol)
    // Swap the values when toggling
    setFormData((prev) => ({
      ...prev,
      airdropAmount: prev.solAmount,
      solAmount: prev.airdropAmount,
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

  const initiateAirdrop = async () => {
    setIsAirdropInProgress(true)
    // Simulate airdrop process
    await new Promise((resolve) => setTimeout(resolve, 5000))
    setIsAirdropInProgress(false)
    setIsAirdropComplete(true)
    // Navigate to analytics page after a short delay
    setTimeout(() => {
      router.push("/analytics")
    }, 2000)
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
                    <div className="flex items-center space-x-4 bg-card p-4 rounded-lg shadow-sm">
                      {formData.image ? (
                        <img src={formData.image} alt={`${formData.coinName} logo`} className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                          {formData.coinName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {formData.coinName} <span className="text-sm text-muted-foreground">${formData.coinTicker}</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">{formData.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="airdropAmount" className="text-base font-medium">
                          Airdrop Amount
                        </Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{formData.coinTicker}</span>
                          <Switch checked={isEnteringSol} onCheckedChange={toggleInputMode} />
                          <span className="text-sm font-medium">SOL</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-grow">
                          <Input
                            id="airdropAmount"
                            placeholder={`Enter amount in ${isEnteringSol ? "SOL" : formData.coinTicker}`}
                            value={isEnteringSol ? formData.solAmount : formData.airdropAmount}
                            onChange={(e) =>
                              updateFormData(isEnteringSol ? "solAmount" : "airdropAmount", e.target.value)
                            }
                            className="pr-20"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm font-medium text-muted-foreground">
                              {isEnteringSol ? "SOL" : formData.coinTicker}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-right text-muted-foreground">
                        ≈ {isEnteringSol ? formData.airdropAmount : formData.solAmount}{" "}
                        {isEnteringSol ? formData.coinTicker : "SOL"}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {errorMessage && (
                <div className="text-red-500 text-sm mt-2">
                  {errorMessage}
                </div>
              )}
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
                    onValueChange={([value]) => updateWeight(type as "influencer" | "community" | "whale", value)}
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
                    {formData.airdropAmount} {formData.coinTicker} (≈ {formData.solAmount} SOL)
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


"use client"

import { motion } from "framer-motion"

export function AirdropAnimation() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.h2
        className="text-2xl font-bold"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        Airdrop in Progress
      </motion.h2>
      <p className="text-muted-foreground">Please wait while we process your airdrop...</p>
    </div>
  )
}


<div align="center">
  <img src="apps/web/public/logo.svg" alt="CloutDrop Logo" width="100" height="100" />
  
  # CloutDrop 
</div>

CloutDrop is an innovative web3 airdrop platform that revolutionizes how creators and brands distribute tokens to their community. Built during ETHOxford 2025, CloutDrop makes airdrops more engaging, fair, and data-driven.

We find relevant, and powerful KOLs for your airdrop, so theres no more need for the "spray and prey" methods of yesteryear. We have data-driven methods to identify KOLs, from the wallet success, influencer status, and previous communities built.

## 🚀 Features

- **Smart Airdrop Creation**: Easily create and customize token airdrops with our intuitive interface
- **Analytics Dashboard**: Track your airdrop performance with real-time metrics and insights
- **Wallet Integration**: Seamless connection with popular web3 wallets
- **Fair Distribution**: Advanced algorithms ensure equitable token distribution
- **Interactive Animations**: Engaging user experience with dynamic airdrop animations
- **Real-time Updates**: Live tracking of airdrop progress and participant engagement

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Blockchain Integration**: Web3.js
- **Smart Contracts**: Solana

## 🏗️ Project Structure

```
CloutDrop/
├── apps/
│   └── web/                 # Next.js web application
│       ├── app/            
│       │   ├── page.tsx     # Landing page
│       │   └── analytics/   # Analytics dashboard
│       └── components/      # React components
├── packages/
│   └── ui/                  # Shared UI components
└── config/                  # Configuration files
```

## 🚦 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/breadboys/cloutdrop.git
cd cloutdrop
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env
```

4. Run the development server:
```bash
pnpm dev
```

## 🎮 Usage

1. Connect your wallet using the "Connect Wallet" button
2. Create a new airdrop by filling out the launch form
3. Set your distribution parameters and token details
4. Monitor your airdrop's performance in the analytics dashboard
5. Watch as participants claim their tokens

## 🏆 Hackathon Achievement

Built during ETHGlobal London 2024, CloutDrop aims to solve the challenges of fair token distribution while providing an engaging user experience for both creators and participants.

## 👥 Team

- Henry - Buidler
- Joey - Buidler


## 📄 License
This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).

You are free to:

Copy, distribute, and display the code
Remix, transform, and build upon the code for non-commercial purposes only
Conditions:

You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
You cannot use the code for commercial purposes.
---

Built with ❤️ at ETHOxford 2025 


# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/ui/button"
```

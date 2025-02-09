from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools.render import format_tool_to_openai_function
import os
from typing import List, Dict, Any
from .twitter_scraper import ApiDojoTweetScraper
from .token_scraper import SolanaTokenScraper
from loguru import logger
import asyncio
from dotenv import load_dotenv

load_dotenv()

class TokenAnalysisTools:
    def __init__(self):
        self.twitter_scraper = None
        self.solana_scraper = None
        self.telegram_scraper = None
        self.discord_scraper = None

    def init_twitter_scraper(self, token: str):
        """Initialize Twitter scraper with the token"""
        self.twitter_scraper = ApiDojoTweetScraper(token)
        
    def init_solana_scraper(self, rpc_urls: List[str] = None):
        """Initialize Solana scraper with optional RPC URLs"""
        self.solana_scraper = SolanaTokenScraper(rpc_urls=rpc_urls)

    def init_telegram_scraper(self, token: str):
        """Initialize Telegram scraper with the token
        
        Coming soon.
        """
        self.telegram_scraper = None

    def init_discord_scraper(self, token: str):
        """Initialize Discord scraper with the token
        
        Coming soon.
        """
        self.discord_scraper = None

    async def search_twitter_mentions(self, ticker: str) -> List[Dict[str, Any]]:
        """Search Twitter for mentions of a token ticker"""
        if not self.twitter_scraper:
            self.init_twitter_scraper(ticker)
        
        try:
            results = await self.twitter_scraper.search_token_mentions()
            # Extract relevant user data
            user_data = []
            for item in results:
                user = item['user_account']
                user_data.append({
                    'username': user['username'],
                    'follower_count': user['follower_count'],
                    'engagement_level': user['engagement_level'],
                    'is_verified': user['is_verified'] or user['is_blue_verified']
                })
            return user_data
        except Exception as e:
            logger.error(f"Error searching Twitter: {e}")
            return []
        
    async def search_telegram_mentions(self, ticker: str) -> List[Dict[str, Any]]:
        """Search Telegram for mentions of a token ticker"""
        if not self.telegram_scraper:
            self.init_telegram_scraper(ticker)
            
        try:
            results = await self.telegram_scraper.search_token_mentions()
            return results
        except Exception as e:
            logger.error(f"Error searching Telegram: {e}")
            return []
        
    async def search_discord_mentions(self, ticker: str) -> List[Dict[str, Any]]:
        """Search Discord for mentions of a token ticker"""
        if not self.discord_scraper:
            self.init_discord_scraper(ticker)
            
        try:
            results = await self.discord_scraper.search_token_mentions()
            return results
        except Exception as e:
            logger.error(f"Error searching Discord: {e}")
            return []


    def get_token_whales(self, certificate: str) -> List[Dict[str, Any]]:
        """Get whale wallets for a token using its certificate"""
        if not self.solana_scraper:
            self.init_solana_scraper()
            
        try:
            # Get transactions and analyze whales
            transactions_df = self.solana_scraper.get_token_transactions(certificate)
            if transactions_df is None:
                return []
                
            whales_df = self.solana_scraper.get_early_whales(transactions_df)
            if whales_df is None:
                return []
                
            # Convert whale data to list of dictionaries
            whale_data = []
            for _, whale in whales_df.iterrows():
                whale_data.append({
                    'wallet_address': whale['wallet_address'],
                    'total_amount': float(whale['amount']),
                    'first_buy_date': whale['date'].isoformat()
                })
            return whale_data
        except Exception as e:
            logger.error(f"Error getting token whales: {e}")
            return []

def create_token_analysis_agent():
    """Create a LangChain agent for token analysis"""
    tools = TokenAnalysisTools()
    
    # Define tools for the agent
    tool_list = [
        Tool(
            name="search_twitter_mentions",
            description="Search Twitter for mentions of a token ticker. Input should be the token ticker (e.g. 'PEPE', 'BONK')",
            func=lambda ticker: asyncio.run(tools.search_twitter_mentions(ticker)),
            return_direct=True
        ),
        Tool(
            name="get_token_whales",
            description="Get whale wallets for a token using its Solana certificate. Input should be the token's certificate address",
            func=lambda certificate: asyncio.run(tools.get_token_whales(certificate)),
            return_direct=True
        ),
        Tool(
            name="search_telegram_mentions",
            description="Search Telegram for mentions of a token ticker. Input should be the token ticker (e.g. 'PEPE', 'BONK')",
            func=lambda ticker: asyncio.run(tools.search_telegram_mentions(ticker)),
            return_direct=True
        ),
        Tool(
            name="search_discord_mentions",
            description="Search Discord for mentions of a token ticker. Input should be the token ticker (e.g. 'PEPE', 'BONK')",
            func=lambda ticker: asyncio.run(tools.search_discord_mentions(ticker)),
            return_direct=True
        )
    ]

    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an AI agent specialized in analyzing tokens on Solana blockchain and Twitter.
        Your goal is to find and analyze whale wallets and influential Twitter profiles discussing the token.
        Use the provided tools to gather information and present it in a clear, structured format.
        
        For each analysis task:
        1. Search Twitter for mentions using the token ticker
        2. Get whale wallets using the token certificate
        3. Combine and analyze the data to identify key players
        
        Present your findings in a clear format, highlighting:
        - Top whale wallets and their holdings
        - Influential Twitter profiles discussing the token
        - Any notable patterns or connections"""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])

    # Initialize ChatOpenAI
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.2,
    )

    # Create the agent
    tools_for_agent = [format_tool_to_openai_function(t) for t in tool_list]
    agent = create_openai_tools_agent(llm, tools_for_agent, prompt)

    # Create the agent executor
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tool_list,
        verbose=True,
        handle_parsing_errors=True,
    )

    return agent_executor

def analyze_token(ticker: str, certificate: str) -> Dict[str, Any]:
    """
    Analyze a token using Twitter and Solana chain data
    
    Args:
        ticker (str): Token ticker (e.g. 'PEPE', 'BONK')
        certificate (str): Solana token certificate address
        
    Returns:
        Dict containing analysis results with Twitter profiles and whale wallets
    """
    agent = create_token_analysis_agent()
    
    print(f"Analyzing token {ticker} with certificate {certificate}")
    # Run the analysis with empty chat history
    result = agent.invoke({
        "input": f"""Analyze the token with ticker {ticker} and certificate {certificate}.
        Find influential Twitter profiles discussing it and identify whale wallets.
        Also find any relevant telegram channels and discord servers discussing it and join them.
        """,
        "chat_history": []  # Add empty chat history
    })
    
    return result
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
    model="gpt-4-turbo-preview",
    temperature=0,
) 
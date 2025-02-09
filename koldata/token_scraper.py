from solana.rpc.api import Client
import pandas as pd
from datetime import datetime
import time
import numpy as np
import json
from solders.pubkey import Pubkey
import sys
import logging
from typing import Optional
import random
import backoff
import httpx
import solana.exceptions

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def load_config(config_path="config.json"):
    """Load configuration from JSON file"""
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Error loading config: {str(e)}")
        return None

# Load configuration
CONFIG = load_config()
if CONFIG is None:
    raise Exception("Failed to load configuration")

class SolanaTokenScraper:
    def __init__(self, rpc_urls=None):
        # Use multiple RPC endpoints if provided, otherwise use config
        self.rpc_urls = rpc_urls if rpc_urls else [CONFIG["rpc"]["url"]]
        self.current_rpc_index = 0
        self.clients = [Client(url) for url in self.rpc_urls]
        self.request_delay = CONFIG["rpc"]["request_delay"]
        self.max_retries = 5
        self.base_delay = 2.0  # Increased base delay
        
    def _get_next_client(self):
        """Round-robin between available RPC endpoints"""
        self.current_rpc_index = (self.current_rpc_index + 1) % len(self.clients)
        return self.clients[self.current_rpc_index]
        
    @backoff.on_exception(
        backoff.expo,
        (solana.exceptions.SolanaRpcException, httpx.HTTPStatusError),
        max_tries=5,  # Increased max tries
        max_time=60,  # Increased max time
        base=2,       # Base for exponential backoff
        jitter=None   # Disable jitter as we're adding our own
    )
    def _get_transaction_with_retry(self, signature: str) -> Optional[dict]:
        """Get transaction with exponential backoff retry"""
        try:
            # Add larger jitter to delay to avoid rate limits
            jitter = random.uniform(1.0, 3.0)  # Increased jitter range
            time.sleep(self.request_delay + jitter)
            
            # Use round-robin client selection
            client = self._get_next_client()
            
            return client.get_transaction(
                signature,
                encoding="json",
                max_supported_transaction_version=0
            )
        except Exception as e:
            logging.warning(f"Error fetching transaction {signature}: {str(e)}")
            raise

    def get_token_transactions(self, token_address, limit=CONFIG["transactions"]["limit"]):
        """
        Fetch all transactions for a given token address
        """
        try:
            # Convert string address to Pubkey
            token_pubkey = Pubkey.from_string(token_address)
            logging.info(f"Fetching transactions for token: {token_address}")
            
            # Initialize empty lists to store transaction data
            wallet_addresses = []
            amounts = []
            dates = []
            transaction_types = []
            
            # Get signature history for the token with chunking
            chunk_size = 25  # Reduced from 50 to 25
            remaining = limit
            last_signature = None
            
            while remaining > 0:
                current_chunk = min(chunk_size, remaining)
                
                # Get signatures for current chunk using round-robin client
                client = self._get_next_client()
                if last_signature:
                    signatures = client.get_signatures_for_address(
                        token_pubkey,
                        limit=current_chunk,
                        before=last_signature
                    )
                else:
                    signatures = client.get_signatures_for_address(
                        token_pubkey,
                        limit=current_chunk
                    )
                
                if not signatures.value:
                    break
                    
                logging.info(f"Processing chunk of {len(signatures.value)} transactions")
                
                # Process chunk
                for idx, sig in enumerate(signatures.value):
                    try:
                        logging.info(f"Processing transaction {idx + 1}/{len(signatures.value)}: {sig.signature}")
                        
                        # Use retry mechanism for getting transaction
                        tx_response = self._get_transaction_with_retry(sig.signature)

                        # More detailed response checking
                        if tx_response is None:
                            logging.warning(f"No response for transaction: {sig.signature}")
                            continue

                        # Debug log the response
                        logging.debug(f"Transaction response type: {type(tx_response)}")
                        logging.debug(f"Transaction response: {tx_response}")

                        # Handle solders.rpc.responses.GetTransactionResp type
                        if hasattr(tx_response, 'value'):
                            tx = tx_response.value
                        elif hasattr(tx_response, 'result'):
                            tx = tx_response.result
                        elif isinstance(tx_response, dict):
                            tx = tx_response.get('result')
                        else:
                            logging.warning(f"Unexpected transaction response format: {type(tx_response)}")
                            continue

                        if tx is None:
                            logging.warning(f"No transaction data in response for: {sig.signature}")
                            continue

                        # Get block time safely
                        block_time = None
                        if hasattr(tx, 'block_time'):
                            block_time = tx.block_time
                        elif isinstance(tx, dict):
                            block_time = tx.get('block_time')
                        
                        if block_time is None:
                            logging.warning(f"No block time for transaction: {sig.signature}")
                            continue

                        # Parse transaction timestamp
                        tx_date = datetime.fromtimestamp(block_time)
                        
                        # Get meta data safely
                        meta = None
                        if hasattr(tx, 'meta'):
                            meta = tx.meta
                        elif isinstance(tx, dict):
                            meta = tx.get('meta')
                            
                        if meta is None:
                            logging.warning(f"No meta data for transaction: {sig.signature}")
                            continue

                        pre_balances = {}
                        post_balances = {}

                        # Get meta data safely
                        if isinstance(meta, dict):
                            pre_token_balances = meta.get("preTokenBalances", []) or meta.get("pre_token_balances", [])
                            post_token_balances = meta.get("postTokenBalances", []) or meta.get("post_token_balances", [])
                        else:
                            pre_token_balances = getattr(meta, "preTokenBalances", []) or getattr(meta, "pre_token_balances", [])
                            post_token_balances = getattr(meta, "postTokenBalances", []) or getattr(meta, "post_token_balances", [])

                        # Debug log token balances
                        logging.debug(f"Pre-token balances: {pre_token_balances}")
                        logging.debug(f"Post-token balances: {post_token_balances}")

                        if not pre_token_balances or not post_token_balances:
                            logging.warning(f"No token balance data for transaction: {sig.signature}")
                            continue

                        # Extract pre-token balances with detailed error logging
                        for balance in pre_token_balances:
                            try:
                                if isinstance(balance, dict):
                                    owner = balance.get("owner")
                                    ui_amount = (balance.get("uiTokenAmount", {}) or balance.get("ui_token_amount", {})).get("amount")
                                else:
                                    owner = getattr(balance, "owner", None)
                                    ui_token_amount = getattr(balance, "uiTokenAmount", None) or getattr(balance, "ui_token_amount", None)
                                    ui_amount = getattr(ui_token_amount, "amount", None) if ui_token_amount else None
                                
                                if owner and ui_amount is not None:
                                    try:
                                        pre_balances[str(owner)] = float(ui_amount)
                                    except (ValueError, TypeError) as e:
                                        logging.warning(f"Invalid amount value in pre-balance: {ui_amount}, Error: {str(e)}")
                                        continue
                            except Exception as e:
                                logging.error(f"Error processing pre-balance: {balance}, Error: {str(e)}")
                                continue

                        # Extract post-token balances with detailed error logging
                        for balance in post_token_balances:
                            try:
                                if isinstance(balance, dict):
                                    owner = balance.get("owner")
                                    ui_amount = (balance.get("uiTokenAmount", {}) or balance.get("ui_token_amount", {})).get("amount")
                                else:
                                    owner = getattr(balance, "owner", None)
                                    ui_token_amount = getattr(balance, "uiTokenAmount", None) or getattr(balance, "ui_token_amount", None)
                                    ui_amount = getattr(ui_token_amount, "amount", None) if ui_token_amount else None
                                
                                if owner and ui_amount is not None:
                                    try:
                                        post_balances[str(owner)] = float(ui_amount)
                                    except (ValueError, TypeError) as e:
                                        logging.warning(f"Invalid amount value in post-balance: {ui_amount}, Error: {str(e)}")
                                        continue
                            except Exception as e:
                                logging.error(f"Error processing post-balance: {balance}, Error: {str(e)}")
                                continue

                        # Debug log the processed balances
                        logging.debug(f"Processed pre-balances: {pre_balances}")
                        logging.debug(f"Processed post-balances: {post_balances}")

                        # Compare balances to determine transaction type
                        for owner, post_amount in post_balances.items():
                            pre_amount = pre_balances.get(owner, 0.0)
                            amount_change = post_amount - pre_amount
                            
                            if amount_change != 0:
                                wallet_addresses.append(owner)
                                amounts.append(abs(amount_change))
                                dates.append(tx_date)
                                transaction_types.append('buy' if amount_change > 0 else 'sell')
                        
                        # Add delay to avoid rate limiting
                        time.sleep(self.request_delay)
                        
                    except Exception as e:
                        logging.error(f"Error processing transaction {sig.signature}: {str(e)}")
                        logging.error("Full error details:", exc_info=True)
                        continue
                
                # Update for next iteration
                remaining -= len(signatures.value)
                if signatures.value:
                    last_signature = signatures.value[-1].signature
                
                # Add longer delay between chunks
                time.sleep(5.0)  # Increased from 2.0 to 5.0 seconds
            
            if not wallet_addresses:
                logging.warning("No valid transactions found")
                return None
                
            # Create DataFrame with results
            df = pd.DataFrame({
                'wallet_address': wallet_addresses,
                'amount': amounts,
                'date': dates,
                'transaction_type': transaction_types
            })
            
            # Sort by date
            df = df.sort_values('date')
            logging.info(f"Successfully processed {len(df)} transactions")
            
            return df
            
        except Exception as e:
            logging.error(f"Error fetching transactions: {str(e)}")
            return None

    def get_early_whales(self, df, early_percent=CONFIG["whale_detection"]["early_percent"], 
                        whale_threshold_percentile=CONFIG["whale_detection"]["whale_threshold_percentile"]):
        """
        Identify whale buyers from the first early_percent% of transactions
        """
        if df is None or df.empty:
            return None
            
        # Get early transactions
        early_cutoff = int(len(df) * (early_percent/100))
        early_transactions = df.iloc[:early_cutoff]
        
        # Filter for buy transactions only
        early_buys = early_transactions[early_transactions['transaction_type'] == 'buy']
        
        # Calculate whale threshold
        whale_threshold = np.percentile(df[df['transaction_type'] == 'buy']['amount'], 
                                      whale_threshold_percentile)
        
        # Identify whales (wallets that bought more than threshold)
        whales = early_buys[early_buys['amount'] >= whale_threshold]
        
        # Group by wallet to get total bought amount
        whale_summary = whales.groupby('wallet_address').agg({
            'amount': 'sum',
            'date': 'first'
        }).reset_index()
        
        whale_summary = whale_summary.sort_values('amount', ascending=False)
        
        return whale_summary

def main():
    if len(sys.argv) != 2:
        print("Usage: python token_scraper.py <token_address>")
        print("Example: python token_scraper.py 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")
        sys.exit(1)
        
    # Get token address from command line
    token_address = sys.argv[1]
    
    # Initialize with all available RPC endpoints
    rpc_urls = [CONFIG["rpc"]["url"]] + CONFIG["rpc"].get("alternate_urls", [])
    scraper = SolanaTokenScraper(rpc_urls=rpc_urls)
    
    print(f"Fetching transactions for token: {token_address}")
    
    # Get all transactions
    transactions_df = scraper.get_token_transactions(token_address)
    
    if transactions_df is not None:
        # Save all transactions to CSV
        transactions_file = CONFIG["output"]["transactions_file_template"].format(token_address)
        transactions_df.to_csv(transactions_file, index=False)
        print(f"Saved all transactions to {transactions_file}")
        
        # Get and save early whales
        whales_df = scraper.get_early_whales(transactions_df)
        if whales_df is not None:
            whales_file = CONFIG["output"]["whales_file_template"].format(token_address)
            whales_df.to_csv(whales_file, index=False)
            print(f"\nSaved early whales to {whales_file}")
            
            print("\nTop 10 Early Whales:")
            print(whales_df.head(10))
            
            print(f"\nTotal number of early whales: {len(whales_df)}")
    
if __name__ == "__main__":
    main() 
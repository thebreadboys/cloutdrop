from .ai_chain_analysis_agent import analyze_token

# Example usage
ticker = "LETSGO"
certificate = "7GF4v9SAd2Xm5sNJaDVKhfDDqFG5KuLgS6avhzfxPDUE"  # Example certificate

print(f"Starting analysis")
results = analyze_token(ticker, certificate)
print("Analysis Results:")
print(results) 
# backend/token_auth.py
from w3_utils import store_token_on_blockchain, verify_token_on_blockchain
import random
import string
import time
from logger import get_logger

# Get logger
logger = get_logger()

def generate_unique_token():
    """Generate a random unique token."""
    token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    logger.debug(f"Generated token: {token}")
    return token

def get_or_generate_token(user_id):
    """
    Generate a unique token for a user and store it on the blockchain.
    
    Args:
        user_id (str): The user ID to associate with the token
        
    Returns:
        str: The generated token
    """
    logger.info(f"Generating token for user: {user_id}")
    start_time = time.time()
    
    # In production, we would check for existing tokens
    # For better performance, we'll generate a new token with high entropy
    # The chance of collision with 10 alphanumeric chars is extremely low
    token = generate_unique_token()
    logger.debug(f"Generated token for user {user_id}: {token}")
    
    # Store token on blockchain asynchronously
    # We'll return the token immediately and let the blockchain storage happen in the background
    # This significantly improves user experience
    
    # For now, we'll still call this synchronously but with a shorter timeout
    tx_hash = store_token_on_blockchain(token)
    
    if tx_hash:
        logger.info(f"Token {token} stored on blockchain for user {user_id}. TX: {tx_hash}")
    else:
        logger.warning(f"Failed to store token {token} on blockchain for user {user_id}")
        # Even if blockchain storage fails, we still return the token
        # The token can be re-stored later if needed
    
    elapsed_time = time.time() - start_time
    logger.debug(f"Token generation completed in {elapsed_time:.4f} seconds")
    
    return token

def verify_token(token):
    """
    Verify if a token exists on the blockchain.
    
    Args:
        token (str): The token to verify
        
    Returns:
        bool: True if the token is valid, False otherwise
    """
    logger.info(f"Verifying token: {token}")
    start_time = time.time()
    
    # Verify token on blockchain
    is_valid = verify_token_on_blockchain(token)
    
    elapsed_time = time.time() - start_time
    logger.debug(f"Token verification completed in {elapsed_time:.4f} seconds")
    
    if is_valid:
        logger.info(f"Token {token} is valid")
    else:
        logger.info(f"Token {token} is invalid")
    
    return is_valid

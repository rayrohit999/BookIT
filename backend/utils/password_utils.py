"""
Password generation utilities for BookIT
"""
import secrets
import string


def generate_random_password(length=12):
    """
    Generate a secure random password.
    
    Args:
        length (int): Length of password (default: 12)
        
    Returns:
        str: Randomly generated password
        
    Password composition:
        - Uppercase letters
        - Lowercase letters  
        - Digits
        - Special characters: !@#$%^&*
    """
    # Define character sets
    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special = "!@#$%^&*"
    
    # Combine all character sets
    all_characters = uppercase + lowercase + digits + special
    
    # Ensure at least one character from each set
    password = [
        secrets.choice(uppercase),
        secrets.choice(lowercase),
        secrets.choice(digits),
        secrets.choice(special),
    ]
    
    # Fill the rest randomly
    password += [secrets.choice(all_characters) for _ in range(length - 4)]
    
    # Shuffle to avoid predictable patterns
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)


def is_strong_password(password):
    """
    Check if a password meets strength requirements.
    
    Args:
        password (str): Password to check
        
    Returns:
        tuple: (bool, str) - (is_strong, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    
    special_chars = "!@#$%^&*"
    if not any(c in special_chars for c in password):
        return False, f"Password must contain at least one special character ({special_chars})"
    
    return True, "Password is strong"

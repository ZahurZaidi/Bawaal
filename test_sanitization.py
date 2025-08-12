#!/usr/bin/env python3
"""
Test script for text sanitization to fix Unicode issues
"""

import re

def test_sanitize_text():
    """Test the text sanitization function"""
    
    def sanitize_text(text: str) -> str:
        """Clean text to remove problematic characters for database storage"""
        if not text:
            return ""
        
        # Remove null bytes and other control characters that cause DB issues
        text = text.replace('\x00', '')  # Remove null bytes
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ' ', text)  # Remove control chars
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)  # Replace multiple whitespace with single space
        text = text.strip()
        
        # Ensure valid UTF-8 encoding
        try:
            text.encode('utf-8')
        except UnicodeEncodeError:
            # If encoding fails, replace problematic characters
            text = text.encode('utf-8', errors='replace').decode('utf-8')
        
        return text
    
    # Test cases
    test_cases = [
        # Normal text
        "This is normal text",
        
        # Text with null bytes
        "Text with\x00null bytes",
        
        # Text with control characters
        "Text\x01with\x02control\x03chars",
        
        # Text with multiple whitespace
        "Text   with    multiple     spaces",
        
        # Text with newlines and tabs
        "Text\nwith\nnewlines\tand\ttabs",
        
        # Empty text
        "",
        
        # Only whitespace
        "   \t\n   ",
    ]
    
    print("Testing text sanitization...")
    for i, test_text in enumerate(test_cases):
        original = repr(test_text)
        sanitized = sanitize_text(test_text)
        cleaned = repr(sanitized)
        
        print(f"Test {i+1}:")
        print(f"  Original: {original}")
        print(f"  Cleaned:  {cleaned}")
        print(f"  Valid:    {bool(sanitized)}")
        print()
    
    # Test UTF-8 encoding
    print("Testing UTF-8 encoding compatibility...")
    problematic_text = "Text\x00with\x01null\x02and\x03control\x04chars"
    cleaned = sanitize_text(problematic_text)
    
    try:
        encoded = cleaned.encode('utf-8')
        decoded = encoded.decode('utf-8')
        print(f"✅ UTF-8 encoding test passed")
        print(f"   Original: {repr(problematic_text)}")
        print(f"   Cleaned:  {repr(cleaned)}")
        print(f"   Encoded:  {len(encoded)} bytes")
    except Exception as e:
        print(f"❌ UTF-8 encoding test failed: {e}")

if __name__ == "__main__":
    test_sanitize_text()

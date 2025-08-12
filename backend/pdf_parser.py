import pypdf
import logging
from typing import List
import io
import re

logger = logging.getLogger(__name__)

class PDFParser:
    def __init__(self):
        pass
    
    def _sanitize_text(self, text: str) -> str:
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
    
    async def parse_pdf(self, pdf_content: bytes) -> List[str]:
        """Parse PDF content and extract text chunks"""
        try:
            # Create a file-like object from bytes
            pdf_file = io.BytesIO(pdf_content)
            
            # Parse PDF
            pdf_reader = pypdf.PdfReader(pdf_file)
            
            text_chunks = []
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    # Extract text from page
                    page_text = page.extract_text()
                    
                    if page_text and page_text.strip():
                        # Sanitize the extracted text
                        clean_text = self._sanitize_text(page_text)
                        
                        if clean_text:  # Only process if there's clean text
                            # Split page text into chunks
                            chunks = await self._split_text_into_chunks(clean_text)
                            text_chunks.extend(chunks)
                        
                except Exception as e:
                    logger.warning(f"Error extracting text from page {page_num}: {e}")
                    continue
            
            return text_chunks
            
        except Exception as e:
            logger.error(f"Error parsing PDF: {e}")
            raise
    
    async def _split_text_into_chunks(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into chunks of approximately chunk_size characters"""
        # Ensure text is sanitized
        text = self._sanitize_text(text)
        
        if not text:
            return []
            
        if len(text) <= chunk_size:
            return [text.strip()]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundaries
            if end < len(text):
                # Look for sentence endings
                for i in range(end, max(start, end - 100), -1):
                    if text[i-1] in '.!?':
                        end = i
                        break
                # If no sentence ending found, look for word boundaries
                else:
                    for i in range(end, max(start, end - 50), -1):
                        if text[i-1] == ' ':
                            end = i
                            break
            
            chunk = text[start:end].strip()
            if chunk:
                # Sanitize each chunk before adding
                clean_chunk = self._sanitize_text(chunk)
                if clean_chunk:  # Only add non-empty chunks
                    chunks.append(clean_chunk)
            
            start = end
        
        return chunks
    
    async def get_pdf_info(self, pdf_content: bytes) -> dict:
        """Get basic information about the PDF"""
        try:
            pdf_file = io.BytesIO(pdf_content)
            pdf_reader = pypdf.PdfReader(pdf_file)
            
            return {
                "num_pages": len(pdf_reader.pages),
                "file_size": len(pdf_content),
                "title": pdf_reader.metadata.get('/Title', 'Unknown'),
                "author": pdf_reader.metadata.get('/Author', 'Unknown'),
                "subject": pdf_reader.metadata.get('/Subject', 'Unknown')
            }
            
        except Exception as e:
            logger.error(f"Error getting PDF info: {e}")
            return {
                "num_pages": 0,
                "file_size": len(pdf_content),
                "title": "Unknown",
                "author": "Unknown",
                "subject": "Unknown"
            } 
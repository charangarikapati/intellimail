import base64
import re

def parse_mime_body(payload: dict) -> str:
    """Recursively extract plain text body from raw Gmail MIME payload."""
    if not payload:
        return ""

    body_text = ""
    
    if "parts" in payload:
        for part in payload["parts"]:
            mime_type = part.get("mimeType", "")
            if mime_type == "text/plain" and "data" in part.get("body", {}):
                data = part["body"]["data"]
                decoded = base64.urlsafe_b64decode(data.encode("UTF-8")).decode("utf-8", errors="replace")
                body_text += decoded
            elif mime_type == "text/html" and not body_text and "data" in part.get("body", {}):
                data = part["body"]["data"]
                decoded = base64.urlsafe_b64decode(data.encode("UTF-8")).decode("utf-8", errors="replace")
                # Strip HTML tags basic regex
                clean_text = re.sub("<[^<]+?>", "", decoded)
                body_text += clean_text
            elif "parts" in part:
                body_text += parse_mime_body(part)
    elif "body" in payload and "data" in payload["body"]:
        data = payload["body"]["data"]
        body_text = base64.urlsafe_b64decode(data.encode("UTF-8")).decode("utf-8", errors="replace")
        
    return body_text.strip()

def extract_header_value(headers: list, name: str) -> str:
    """Helper to retrieve a header value from Gmail API header list."""
    for header in headers:
        if header.get("name", "").lower() == name.lower():
            return header.get("value", "")
    return ""

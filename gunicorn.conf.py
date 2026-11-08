import os

# Render injects the PORT environment variable (default 10000 on Render)
port = os.environ.get("PORT", "10000")
bind = f"0.0.0.0:{port}"

# Optimal concurrency for Render's 512MB RAM free tier
workers = int(os.environ.get("WEB_CONCURRENCY", 2))
threads = 2
timeout = 120
keepalive = 5

# Stream logs directly to stdout/stderr for Render live log viewer
accesslog = "-"
errorlog = "-"
loglevel = "info"

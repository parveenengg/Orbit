#!/usr/bin/env python3
"""
Local dev server with clean URL rewrites matching vercel.json.
Routes /about -> /pages/about.html, /features -> /pages/features.html, etc.
"""
import http.server
import socketserver
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REWRITES = {
    "/": "/index.html",
    "/home": "/index.html",
    "/about": "/pages/about.html",
    "/features": "/pages/features.html",
    "/download": "/pages/download.html",
    "/opensource": "/pages/opensource.html",
    "/privacy": "/pages/privacy.html",
    "/manifesto": "/pages/manifesto.html",
    "/documentation": "/pages/documentation.html",
}

class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def translate_path(self, path):
        clean_path = path.split("?")[0].rstrip("/")
        if not clean_path:
            clean_path = "/"
        if clean_path in REWRITES:
            path = REWRITES[clean_path]
        else:
            path = clean_path

        resolved = super().translate_path(path)
        if not os.path.exists(resolved) and os.path.exists(resolved + ".html"):
            return resolved + ".html"
        return resolved

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), CleanUrlHandler) as httpd:
        print(f"Serving Orbit at http://localhost:{port} (clean routes active)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

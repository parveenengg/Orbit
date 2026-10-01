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
    "/privacy-policy": "/pages/privacy.html",
    "/terms": "/pages/terms.html",
    "/terms-and-conditions": "/pages/terms.html",
    "/manifesto": "/pages/manifesto.html",
    "/documentation": "/pages/documentation.html",
    "/robots.txt": "/robots.txt",
    "/sitemap.xml": "/sitemap.xml",
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
        if not os.path.exists(resolved):
            if os.path.exists(resolved + ".html"):
                return resolved + ".html"
            basename = os.path.basename(resolved)
            if basename.endswith(".css") and os.path.exists(os.path.join(DIRECTORY, "css", basename)):
                return os.path.join(DIRECTORY, "css", basename)
            if basename.endswith(".js") and os.path.exists(os.path.join(DIRECTORY, "js", basename)):
                return os.path.join(DIRECTORY, "js", basename)
        return resolved

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            custom_404 = os.path.join(DIRECTORY, "404.html")
            if os.path.exists(custom_404):
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(custom_404, "rb") as f:
                    self.wfile.write(f.read())
                return
        super().send_error(code, message, explain)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), CleanUrlHandler) as httpd:
        print(f"Serving Orbit at http://localhost:{port} (clean routes active)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

#!/usr/bin/env python3
"""Minimal static server that avoids os.getcwd() (blocked in the preview sandbox)."""
import http.server, socketserver, functools

DIRECTORY = "/Users/paapatype/Desktop/GD4/Raka Flaka/Raka Website /Technical Website Data"
PORT = 8000

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIRECTORY)


class Server(socketserver.TCPServer):
    allow_reuse_address = True


with Server(("", PORT), Handler) as httpd:
    print(f"serving {DIRECTORY} on http://localhost:{PORT}")
    httpd.serve_forever()

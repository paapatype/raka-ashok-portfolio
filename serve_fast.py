#!/usr/bin/env python3
"""Threaded HTTP/1.1 static server (keep-alive + parallel) — much smoother over a tunnel."""
import functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

DIRECTORY = "/Users/paapatype/Desktop/GD4/Raka Flaka/Raka Website /Technical Website Data"
PORT = 8000


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"  # enables keep-alive (Content-Length is already sent)

    def end_headers(self):
        # let the browser cache assets between page navigations
        if self.path.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=86400")
        super().end_headers()

    def log_message(self, *a):
        pass  # quiet


HandlerFactory = functools.partial(Handler, directory=DIRECTORY)
httpd = ThreadingHTTPServer(("0.0.0.0", PORT), HandlerFactory)
httpd.daemon_threads = True
print(f"fast server (HTTP/1.1, threaded) on {PORT}, serving {DIRECTORY}")
httpd.serve_forever()

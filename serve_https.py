#!/usr/bin/env python3
"""
Simple HTTPS static file server for local preview.
Run: python3 serve_https.py
Serves files from the repository root on https://127.0.0.1:8443
"""
import http.server
import ssl

HOST = '127.0.0.1'
PORT = 8443

handler = http.server.SimpleHTTPRequestHandler
httpd = http.server.HTTPServer((HOST, PORT), handler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('server.pem')

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
print(f"Serving HTTPS on https://{HOST}:{PORT} (press CTRL+C to stop)")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print('\nServer stopped')

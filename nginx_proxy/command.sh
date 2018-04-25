#!/bin/bash -e
# Run nginx in background, try to obtain SSL cert, run with deamon off for docker
nginx
python /setup_ssl.py || true
nginx -s stop
nginx -g "daemon off;"

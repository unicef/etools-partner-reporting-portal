#!/bin/bash -e
nginx
python /setup_ssl.py || true
nginx -s stop
nginx -g "daemon off;"

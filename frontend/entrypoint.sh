#!/bin/sh
set -e

if [ -z "$API_BACKEND" ]; then
  echo "ERROR: API_BACKEND is not set"
  exit 1
fi

envsubst '${API_BACKEND}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
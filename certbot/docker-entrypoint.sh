#!/bin/sh
set -e

mkdir -p /etc/cloudflare && \
echo "dns_cloudflare_email = $EMAIL_CERTIFICATOR" > /etc/cloudflare/cloudflare.ini && \
echo "dns_cloudflare_api_key = $CLOUDFLARE_API_KEY" >> /etc/cloudflare/cloudflare.ini && \
chmod 600 /etc/cloudflare/cloudflare.ini

set +e

# Request the certificate for the given domains
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/cloudflare/cloudflare.ini \
  --email $EMAIL_CERTIFICATOR \
  --agree-tos \
  --no-eff-email \
  -d engine.permissioning.city \
  -d "*.engine.permissioning.city" \
  --non-interactive --quiet

set -e

# Set up the renewal loop
trap exit TERM; \
while :; do \
  sleep 6h & wait $!; \
  certbot renew --non-interactive --quiet; \
done

tail -f /dev/null

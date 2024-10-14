# Permissioning The City - Permission Engine

## How to run in local dev environment

1. [Install docker](https://docs.docker.com/engine/install/)
1. Clone this repo

   ```bash
   git clone --recurse-submodules https://github.com/Dark-Matter-Labs/permissioning-city-engine.git
   ```

1. Set `.env` file with reference `.env.example`

1. To use `http://localhost/api` for development, replace `nginx/conf.d/engine.permissioning.city.conf` with this content (skip this in prod)

   ```nginx
   server {
      listen 80;
      server_name localhost;

      add_header 'Access-Control-Allow-Origin' '*';
      add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
      add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization';
      add_header 'Access-Control-Allow-Credentials' 'true';

      location / {
         proxy_pass http://ptc-dashboard:5173;
      }

      location /api {
         proxy_pass http://permission-engine:3000/api;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
      }
   }

   ```

1. Run services with `docker compose`

   ```bash
   docker compose up -d --build
   ```

1. Open `http://localhost/api` in browser to access swagger API document
1. Get google authorization by clicking on Authorize button with lock icon
   - Go for OAuth2
   - Check both profile and email
   - You will be redirected to domain's root path after google login
   - There will be `accessToken` and `refreshToken` set in your cookie
1. Come back to `http://localhost/api` to continue with Swagger UI

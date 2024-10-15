# Permissioning The City - Permission Engine

## How to run in local dev environment

1. [Install docker](https://docs.docker.com/engine/install/)
1. Clone this repo

   ```bash
   git clone --recurse-submodules https://github.com/Dark-Matter-Labs/permissioning-city-engine.git
   ```

1. Set `.env` file with reference `.env.example`

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

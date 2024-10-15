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

### Clear database and insert mockup data

1. Run clear-database command to remove and backup current data

   ```bash
   ./script/clear-database.sh
   ```

1. Run services with `docker compose`

   ```bash
   docker compose up -d --build
   ```

1. Go to http://localhost and login to create a user
1. Restart `permission-engine` container

   ```bash
   docker restart permission-engine
   ```

1. Go to http://localhost/api#/space/SpaceController_findAll to check mockup data exists

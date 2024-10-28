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
   ./scripts/clear-database.sh
   ```

1. Add 4 emails to `.env` file for creating test users

   ```bash
   # first email: space rule author
   # second one: space event rule author
   # third one: event organizer
   TEST_EMAILS="test1@example.com,test2@example.com,test3@example.com,test4@example.com"
   ```

2. Request the repo admin to register the test emails to AWS SES

3. Run services with `docker compose`

   ```bash
   docker compose up -d --build
   ```

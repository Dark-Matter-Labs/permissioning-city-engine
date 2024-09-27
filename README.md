# Permissioning The City - Permission Engine

## How to run in local environment

1. [Install docker](https://docs.docker.com/engine/install/)
1. Clone this repo

    ```bash
    git clone https://github.com/Dark-Matter-Labs/permissioning-city-engine.git
    ```

1. Set .env file

    ```text
    PERMISSION_ENGINE_PORT=3000

    REDIS_HOST=redis
    REDIS_PORT=6379

    AWS_ACCESS_KEY_ID=AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY
    AWS_REGION=AWS_REGION
    AWS_S3_BUCKET_NAME=AWS_S3_BUCKET_NAME

    DATABASE_HOST=postgres
    DATABASE_PORT=ptc
    POSTGRES_USER=5432
    POSTGRES_PASSWORD= USERNAME
    POSTGRES_DATABASE=PASSWORD

    GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET

    EMAIL_FROM=EMAIL_FROM
    ```

1. Run services with `docker compose`

    ```bash
    docker compose up -d --build
    ```

1. Open `localhost:3000/api` in browser to access swagger API document

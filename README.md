# Permissioning The City - Permission Engine

Permissioning The City is an open-source permission engine designed to manage and process various types of permission requests within a city infrastructure. This engine leverages modern technologies such as React, NestJS, Bull, Redis, and AWS services to provide a robust and scalable solution for handling permissions.

## Features

- **Permission Request Handling**: Manage and process different types of permission requests.
- **Notification System**: Send notifications via email using AWS SES and update users via web sockets.
- **Rule Management**: Define and enforce rules for different spaces and events.
- **Auto Approval**: Automatically approve requests based on predefined conditions.
- **Logging and Monitoring**: Comprehensive logging for debugging and monitoring purposes.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/)
- [Node.js](https://nodejs.org/) (for local development)

### Installation

1. Clone the repository:

   ```bash
   git clone --recurse-submodules https://github.com/Dark-Matter-Labs/permissioning-city-engine.git
   ```

2. Set up the `.env` file with reference to `.env.example`.

3. Run the services using Docker Compose:

   ```bash
   docker compose up -d --build
   ```

4. Open `http://localhost/api` in your browser to access the Swagger API documentation.

5. Get Google authorization by clicking on the Authorize button with the lock icon:
   - Select OAuth2
   - Check both profile and email
   - You will be redirected to the domain's root path after Google login
   - `accessToken` and `refreshToken` will be set in your cookies

6. Return to `http://localhost/api` to continue with the Swagger UI.

## Environment Variables

Ensure the following environment variables are set in your `.env` file:

```properties
PERMISSION_ENGINE_PORT=3000
REDIS_HOST=redis
REDIS_PORT=6379
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION=your-aws-region
AWS_S3_BUCKET_NAME=your-s3-bucket-name
DATABASE_HOST=postgres
DATABASE_PORT=5432
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD="your-postgres-password"
POSTGRES_DATABASE=your-postgres-database
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_DOMAIN="http://localhost"
EMAIL_FROM="noreply@permissioning.city"
EMAIL_CERTIFICATOR="your-email-certificator"
JWT_SECRET="your-jwt-secret"
JWT_ACCESS_TOKEN_EXPIRATION_TIME=3600
JWT_REFRESH_TOKEN_EXPIRATION_TIME=86400
NODE_ENV=dev
CHOKIDAR_USEPOLLING=true
CHOKIDAR_INTERVAL=1000
IP_LOCATION_PROVIDER="http://ip-api.com"
TEST_EMAILS="test1@example.com,test2@example.com,test3@example.com,test4@example.com"
MAPBOX_ACCESS_TOKEN="your-mapbox-access-token"
MOCKUP_DATA=true
MAX_WEBSOCKET_CONNECTIONS=1000
SLACK_WEBHOOK_URL="your-slack-webhook-url"
DOMAIN="localhost"
CLOUDFLARE_API_KEY="your-cloudflare-api-key"
ADMIN_EMAIL="admin@example.com"
ADMIN_DOMAIN="example.com"
```

## Contributing

We welcome contributions from the community. To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with a descriptive message.
4. Push your changes to your fork.
5. Create a pull request to the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or support, please contact the repository admin at `admin@permissioning.city`.

We hope you find this project useful and look forward to your contributions!

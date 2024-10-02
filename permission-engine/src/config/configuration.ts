export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DATABASE || '',
  },
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_DOMAIN || 'http://localhost:3000',
    },
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || '',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME || '',
  },
  emailFrom: process.env.EMAIL_FROM || '',
  jwt: {
    secret: process.env.JWT_SECRET || '',
    accessTokenExpirationTime:
      process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || '',
    refreshTokenExpirationTime:
      process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '',
  },
});

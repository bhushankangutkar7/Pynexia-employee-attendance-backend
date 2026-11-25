import { configDotenv } from 'dotenv';

configDotenv({
  path: './.env'
});

// Helper to validate required environment variable
const getEnv = (key, defaultValue = undefined) => {
  const value = process.env[key];

  if (value === undefined || value === '' ) {
    if ( defaultValue !== undefined ) return defaultValue;

    throw new Error(`Missing required environment variable: ${key}`);
  };

  return value;
};

// Application Configuration
export const ENV = getEnv('ENV', 'development');
export const PORT = Number(getEnv('PORT', 8000));

// Database Configuration
export const MONGO_URL = getEnv('MONGO_URL');

// JWT Configuration
export const JWT_SECRET = getEnv('JWT_SECRET');
export const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN', '1h');

// Bcrypt Configuration
export const SALT_ROUNDS = Number(getEnv('SALT_ROUNDS', 10));

// Validate numeric Configuration
if ( !Number.isInteger(PORT) || PORT <= 0 || PORT > 65535 ) {
  throw new Error('PORT must be a valid port number');
};

if ( !Number.isInteger(SALT_ROUNDS) || SALT_ROUNDS < 1 ) {
  throw new Error('SALT_ROUNDS must be a positive integer');
};

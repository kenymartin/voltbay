# Environment Setup Guide

This document explains how to set up environment variables for the VoltBay project.

## Overview

VoltBay uses environment variables to configure different services and environments. Each service has its own environment configuration.

## Quick Setup

1. **Copy the root environment file:**
   ```bash
   cp env.example .env
   ```

2. **Update the values in `.env`** according to your environment (development, staging, production)

3. **For individual services, copy their environment files:**
   ```bash
   # Auth service
   cp backend/auth/env.example backend/auth/.env
   
   # API service
   cp backend/api/env.example backend/api/.env
   
   # Frontend
   cp frontend/env.example frontend/.env
   ```

## Environment Files Structure

```
voltbay/
├── .env                        # Root environment (Docker Compose)
├── env.example                 # Root environment template
├── backend/
│   ├── auth/
│   │   ├── .env               # Auth service environment
│   │   └── env.example        # Auth service template
│   └── api/
│       ├── .env               # API service environment
│       └── env.example        # API service template
└── frontend/
    ├── .env                   # Frontend environment
    └── env.example            # Frontend template
```

## Environment Variables by Service

### Root (.env)
Used by Docker Compose for container configuration:
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- Email configuration for production

### Auth Service (backend/auth/.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Access token expiration
- `REFRESH_TOKEN_EXPIRES_IN` - Refresh token expiration
- `REDIS_URL` - Redis connection string
- `PORT` - Service port (default: 4000)
- Email configuration (optional)

### API Service (backend/api/.env)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `AUTH_SERVICE_URL` - Auth service URL
- `JWT_SECRET` - JWT verification secret
- `PORT` - Service port (default: 5001)
- Upload configuration

### Frontend (frontend/.env)
- `VITE_API_URL` - API service URL
- `VITE_AUTH_URL` - Auth service URL
- App configuration
- Feature flags (optional)

## Security Best Practices

### Development
- Use the provided example values for quick setup
- Never commit actual `.env` files to version control
- Use strong, unique passwords for database

### Production
- Generate strong, random secrets for JWT tokens (minimum 32 characters)
- Use environment-specific database credentials
- Enable HTTPS and update CORS origins
- Configure proper email settings
- Use secure Redis password
- Set strong database passwords

### JWT Secrets
Generate secure JWT secrets:
```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development vs Production

### Development Environment
- Database: Local PostgreSQL or Docker
- Redis: Local Redis or Docker
- CORS: Allow localhost origins
- Email: Development mode (logs to console)
- HTTPS: Not required

### Production Environment
- Database: Managed PostgreSQL service
- Redis: Managed Redis service
- CORS: Restrict to production domains
- Email: Configure SMTP service
- HTTPS: Required
- Use environment variables from hosting platform

## Docker Compose Environment

When using Docker Compose, the root `.env` file is automatically loaded. Individual service environment files are mounted as volumes.

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Verify credentials

2. **JWT token errors**
   - Ensure `JWT_SECRET` is the same across auth and API services
   - Check token expiration settings

3. **CORS errors**
   - Update `CORS_ORIGIN` to match frontend URL
   - Check frontend API URL configuration

4. **Email not working**
   - Verify email credentials
   - Check SMTP settings
   - In development, emails are logged to console

### Environment Validation

The application validates required environment variables on startup. Check the console for any missing or invalid configuration.

## Example Production Setup

```bash
# .env (production)
POSTGRES_DB=voltbay_prod
POSTGRES_USER=voltbay_prod_user
POSTGRES_PASSWORD=super_secure_password_here
JWT_SECRET=your_64_character_hex_secret_here
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
FRONTEND_URL=https://voltbay.com
```

For detailed deployment instructions, see the main [README.md](README.md) file. 
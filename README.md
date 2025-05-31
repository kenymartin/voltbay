# VoltBay - Solar Products Marketplace

A full-stack TypeScript marketplace application for buying, selling, and auctioning solar products. Built with modern technologies and microservices architecture.

## 🌟 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role management
- **Product Management** - Create, edit, delete solar products with specifications
- **Auction System** - Real-time bidding on solar equipment
- **Order Management** - Complete order lifecycle from creation to delivery
- **Messaging System** - Direct communication between buyers and sellers
- **File Upload** - Image upload for product listings
- **Search & Filtering** - Advanced product search with multiple filters
- **Categories** - Hierarchical product categorization
- **Notifications** - Real-time notifications for important events

### User Roles
- **Users** - Buy products, place bids, manage orders
- **Sellers** - List products, manage sales, fulfill orders
- **Admins** - Manage categories, moderate content, system administration

### Technical Features
- **Microservices Architecture** - Separate auth and API services
- **Real-time Updates** - Live auction bidding and notifications
- **File Storage** - Secure image upload and serving
- **Database Relations** - Complex relational data with Prisma ORM
- **Type Safety** - Full TypeScript coverage across frontend and backend
- **Docker Support** - Containerized development and deployment
- **API Documentation** - RESTful API with comprehensive endpoints

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Auth Service  │    │   API Service   │
│   (React/Vite)  │◄──►│   (Express/TS)  │◄──►│   (Express/TS)  │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 5001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         │              │   (Cache)       │              │
         │              │   Port: 6379    │              │
         │              └─────────────────┘              │
         │                                               │
         └─────────────────┬─────────────────────────────┘
                           │
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   (Database)    │
                  │   Port: 5432    │
                  └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server-side code
- **Prisma** - Modern database ORM
- **PostgreSQL** - Relational database
- **Redis** - Caching and session storage
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **Zod** - Schema validation
- **Nodemailer** - Email service

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd voltbay
```

### 2. Environment Setup
Copy the environment files and configure them:

```bash
# Auth service environment
cp backend/auth/.env.example backend/auth/.env

# API service environment  
cp backend/api/.env.example backend/api/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

This will start all services:
- Frontend: http://localhost:3000
- Auth Service: http://localhost:4000
- API Service: http://localhost:5001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 4. Initialize Database
The database will be automatically initialized with:
- Schema creation
- Seed data (categories, admin user, sample products)

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:5001/health
- **Auth Health Check**: http://localhost:4000/health

## 📊 Database Schema

### Core Entities
- **Users** - User accounts with authentication
- **Categories** - Hierarchical product categories
- **Products** - Solar products with specifications
- **Bids** - Auction bids on products
- **Orders** - Purchase orders and fulfillment
- **Messages** - User-to-user messaging
- **Notifications** - System notifications
- **Reviews** - Product reviews and ratings

### Sample Data
The system comes pre-loaded with:
- Solar product categories (panels, batteries, inverters, etc.)
- Admin user (admin@voltbay.com / password123)
- Sample products with specifications
- Product images from Unsplash

## 🔧 Development

### Local Development Setup
```bash
# Install dependencies for all services
npm run install:all

# Start development servers
npm run dev:auth    # Auth service on port 4000
npm run dev:api     # API service on port 5001  
npm run dev:frontend # Frontend on port 3000
```

### Database Management
```bash
# Generate Prisma client
cd backend/auth && npx prisma generate
cd backend/api && npx prisma generate

# Run migrations
cd backend/auth && npx prisma migrate dev

# View database
cd backend/auth && npx prisma studio
```

### API Testing
```bash
# Test auth service
curl http://localhost:4000/health

# Test API service
curl http://localhost:5001/health

# Login and get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@voltbay.com", "password": "password123"}'

# Create a product (with auth token)
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Solar Panel", "description": "Test panel", "price": 299.99, "categoryId": "CATEGORY_ID", "condition": "NEW"}'
```

## 📡 API Endpoints

### Authentication Service (Port 4000)
```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/verify-email      # Email verification
POST   /api/auth/forgot-password   # Password reset request
POST   /api/auth/reset-password    # Password reset
GET    /api/auth/profile           # Get user profile
PUT    /api/auth/profile           # Update user profile
```

### API Service (Port 5001)
```
# Products
GET    /api/products               # List products
POST   /api/products               # Create product
GET    /api/products/:id           # Get product details
PUT    /api/products/:id           # Update product
DELETE /api/products/:id           # Delete product
POST   /api/products/:id/bids      # Place bid
GET    /api/products/:id/bids      # Get product bids

# Categories
GET    /api/categories             # List categories
POST   /api/categories             # Create category (admin)
GET    /api/categories/:id         # Get category details
PUT    /api/categories/:id         # Update category (admin)
DELETE /api/categories/:id         # Delete category (admin)

# Orders
GET    /api/orders                 # List user orders
POST   /api/orders                 # Create order
GET    /api/orders/:id             # Get order details
PATCH  /api/orders/:id/status      # Update order status
PATCH  /api/orders/:id/shipping    # Update shipping info
PATCH  /api/orders/:id/cancel      # Cancel order

# Messages
GET    /api/messages/conversations # List conversations
POST   /api/messages               # Send message
GET    /api/messages/:userId       # Get messages with user
PATCH  /api/messages/:userId/read  # Mark messages as read

# Notifications
GET    /api/notifications          # List notifications
PATCH  /api/notifications/:id/read # Mark notification as read
PATCH  /api/notifications/mark-all-read # Mark all as read
DELETE /api/notifications/:id      # Delete notification

# File Upload
POST   /api/upload/images          # Upload multiple images
POST   /api/upload/image           # Upload single image
DELETE /api/upload/image/:filename # Delete image
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Zod schema validation
- **CORS Protection** - Configured for specific origins
- **Rate Limiting** - API rate limiting to prevent abuse
- **File Upload Security** - File type and size validation
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **XSS Protection** - Helmet.js security headers

## 🚀 Deployment

### Production Environment Variables
```bash
# Auth Service
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/voltbay
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# API Service  
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/voltbay
AUTH_SERVICE_URL=https://auth.yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_AUTH_URL=https://auth.yourdomain.com
```

### Docker Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### Database Migration
```bash
# Run production migrations
docker exec -it voltbay-auth npx prisma migrate deploy
```

## 📈 Monitoring & Logging

- **Health Checks** - Available at `/health` endpoints
- **Structured Logging** - Winston logger with timestamps
- **Error Handling** - Comprehensive error handling and reporting
- **Database Monitoring** - Prisma query logging in development

## 🧪 Testing

### Manual Testing
1. **User Registration/Login** - Test authentication flow
2. **Product Creation** - Create products with images
3. **Auction Bidding** - Place bids on auction items
4. **Order Management** - Complete purchase flow
5. **Messaging** - Send messages between users
6. **File Upload** - Upload product images

### API Testing with curl
See the API Testing section above for example curl commands.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker logs voltbay-postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

**Port Conflicts**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :4000
lsof -i :5001

# Kill processes if needed
kill -9 PID
```

**TypeScript Errors**
```bash
# Regenerate Prisma client
cd backend/auth && npx prisma generate
cd backend/api && npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Email Service Issues**
- Configure proper SMTP credentials in environment variables
- For Gmail, use App Passwords instead of regular passwords
- Email verification is optional for development

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**VoltBay** - Powering the future of solar commerce 🌞⚡ 
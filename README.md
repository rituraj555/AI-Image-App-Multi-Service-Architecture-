<div align="center">
  <h1>🎨 AI Image Generation Backend</h1>
  <p>Scalable microservices backend for AI-powered image generation with coin and subscription models</p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-16.x-339933?logo=nodedotjs)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-5.0-47A248?logo=mongodb)](https://www.mongodb.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

## 📄 Description

A robust, scalable backend system for an AI-powered image generation application. This project follows a microservices architecture with separate services for authentication, user management, coin transactions, AI image generation, and subscription handling.

### ✨ Key Features
- 🔐 **Secure Authentication** with JWT
- 🪙 **Dual Monetization**: Coin-based and subscription-based access
- 🖼️ **AI-Powered Image Generation** using Stability AI
- 📱 **Mobile-First** design with Google Play Billing integration
- ⚡ **High Performance** with optimized database queries
- 🔄 **RESTful API** design with proper status codes and error handling
  - Multiple style presets
  - Adjustable parameters (size, steps, etc.)
  - Image history and management

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                       Client Application                      │
└───────────────────────────────┬───────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────┐
│                       API Gateway (Vercel)                    │
└───────┬───────────────┬───────────────┬───────────────────────┘
        │               │               │
┌───────▼────┐  ┌───────▼──────┐  ┌────▼───────────────────────┐
│  Auth      │  │  User        │  │  Coin                    │
│  Service   │  │  Service     │  │  Service                 │
└────────────┘  └──────────────┘  └───────────┬───────────────┘
                                              │
┌───────────────────────┐  ┌──────────────────▼─────────────────┐
│  Image                │  │  Subscription                     │
│  Generation Service   │  │  Service                          │
└───────────────────────┘  └───────────────────────────────────┘
```

## ⚙️ Technologies Used

### Core
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)

### Third-Party Services
- **AI Image Generation**: Stability AI API
- **Mobile Payments**: Google Play Billing
- **Hosting**: Vercel (Serverless Functions)
- **Storage**: Cloudinary (for image storage)

### Development Tools
- **Testing**: Postman/REST Client
- **Version Control**: Git
- **Environment Management**: dotenv
- **API Documentation**: OpenAPI/Swagger

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account or local MongoDB instance
- Stability AI API key
- Google Play Developer account (for subscription verification)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-image-backend.git
   cd ai-image-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Stability AI
STABILITY_API_KEY=your_stability_ai_api_key

# Google Play (for subscriptions)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
```

## 🧩 Services & APIs

### 🔐 Auth Service
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and get JWT token | ❌ |

### 👤 User Service
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/user/profile` | Get current user's profile | ✅ |
| `PUT` | `/api/user/profile` | Update user profile | ✅ |

### 💰 Coin Service
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/coin/buy` | Purchase coins | ✅ |
| `POST` | `/api/coin/earn` | Earn coins (e.g., watch ad) | ✅ |
| `POST` | `/api/coin/deduct` | Deduct coins | ✅ |
| `GET` | `/api/coin/balance` | Get user's coin balance | ✅ |
| `GET` | `/api/coin/transactions` | Get transaction history | ✅ |

### 🖼️ Image Generation Service
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/image/generate` | Generate AI image | ✅ |
| `GET` | `/api/image/history` | Get generation history | ✅ |
| `GET` | `/api/image/:id` | Get specific image | ✅ |
| `DELETE` | `/api/image/:id` | Delete generated image | ✅ |

### 🧾 Subscription Service
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/subscription/verify` | Verify Google Play subscription | ✅ |
| `GET` | `/api/subscription/status` | Get subscription status | ✅ |

## Example Requests

### Generate Image

```http
POST /api/image/generate
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "prompt": "a beautiful sunset over mountains",
  "stylePreset": "digital-art",
  "width": 1024,
  "height": 1024,
  "samples": 1,
  "steps": 30,
  "cfgScale": 7
}
```

### Get Image History

```http
GET /api/image/history?page=1&limit=10
Authorization: Bearer <your_jwt_token>
```

## Deployment

### Vercel

This application is configured for deployment on Vercel. To deploy:

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the repository to Vercel
3. Add the required environment variables in the Vercel project settings
4. Deploy!

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.

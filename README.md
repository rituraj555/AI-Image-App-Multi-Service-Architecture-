<div align="center">
  <h1>🎨 AI Image Generation Backend</h1>
  <p>Scalable backend for AI-powered image generation with coin-based access control</p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=nodedotjs)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-5.0-47A248?logo=mongodb)](https://www.mongodb.com/)
  [![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=white)](https://swagger.io/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

## 📄 Description

A robust, scalable backend system for an AI-powered image generation application. This project provides a RESTful API for generating AI images using **Stability AI's Stable Diffusion XL 1.0 model**, with built-in user authentication, coin-based access control, and comprehensive API documentation.

## 🚀 Features

### 🖼️ AI Image Generation
- **Stable Diffusion XL 1.0** for high-quality, high-resolution image generation.
- **Multiple Styles**: Support for various artistic styles (e.g., `realistic`, `cartoon`, `anime`).
- **Customizable Parameters**: Control over CFG scale, steps, and seed.
- **Supported Dimensions**: The SDXL 1.0 model supports specific image dimensions:
  - `1024x1024` (Default)
  - `1152x896`
  - `1216x832`
  - `1344x768`
  - `1536x640`
  - `640x1536`
  - `768x1344`
  - `832x1216`
  - `896x1152`
- **Negative Prompts**: Fine-tune image generation with negative prompts.

### 🔐 Authentication & Security
- **JWT-based Authentication** with secure token handling.
- **Role-based Access Control** (User, Admin).
- **Rate Limiting** on sensitive endpoints to prevent abuse.
- **Input Validation** for all API endpoints.
- **Secure API Key Storage**: User-provided Stability AI keys are encrypted before being stored.

### 💰 Coin System
- **Earn Coins**: Users can earn coins through in-app actions (e.g., watching ads).
- **Purchase Coins**: In-app purchases for coin bundles.
- **Cost-Based Access**: Image generation deducts a fixed number of coins.
- **Transaction History**: Users can view their complete coin transaction history.

### 📚 API Documentation
- **Interactive Swagger UI** available at `/api-docs`.
- **OpenAPI 3.0** specification for clear, standardized documentation.
- **Live Testing**: Test API endpoints directly from the browser.

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18.x or later
- MongoDB 5.0 or later
- Stability AI API key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ai-image-generator-backend.git
    cd ai-image-generator-backend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure environment variables**
    Create a `.env` file by copying the example and fill in your configuration details.
    ```bash
    cp .env.example .env
    ```
    > **Note**: Edit `.env` with your `MONGO_URI`, `JWT_SECRET`, `STABILITY_API_KEY`, and other required values.

4.  **Start the development server**
    ```bash
    npm run dev
    ```

5.  **Access the API documentation**
    - Open `http://localhost:8000/api-docs` in your browser (the port may vary based on your `.env` config).

## 🧪 Testing

This project uses Jest for automated testing. Tests run against an in-memory MongoDB server to avoid interfering with your development database.

- **Run all tests:**
  ```bash
  npm test
  ```
- **Run tests in watch mode:**
  ```bash
  npm run test:watch
  ```

## 📚 API Endpoints

All endpoints are prefixed with `/api`. Authentication is required for all routes except for `POST /auth/register` and `POST /auth/login`.

| Method | Endpoint                    | Description                               |
|--------|-----------------------------|-------------------------------------------|
| `POST` | `/auth/register`            | Register a new user.                      |
| `POST` | `/auth/login`               | Login and receive a JWT token.            |
| `GET`  | `/auth/me`                  | Get the current authenticated user's profile. |
| `POST` | `/image/generate`           | Generate a new AI image.                  |
| `GET`  | `/image/history`            | Get the user's image generation history.  |
| `POST` | `/coin/earn`                | Earn coins (e.g., after watching an ad).  |
| `POST` | `/coin/buy`                 | Record a coin purchase.                   |
| `GET`  | `/coin/history`             | Get the user's coin transaction history.  |
| `GET`  | `/coin/balance`             | Get the user's current coin balance.      |
| `POST` | `/api-key`                  | Save or update a user's Stability AI API key. |
| `GET`  | `/api-key`                  | Retrieve the user's saved API key (encrypted). |
| `DELETE`| `/api-key`                  | Delete the user's saved API key.          |
| `POST` | `/subscription/verify`      | Verify a Google Play Store subscription.  |

> For detailed request/response schemas and to try out the endpoints, please visit the **[Swagger UI Documentation](#-api-documentation)**.

## 🏗️ Architecture

The backend follows a modular, layered architecture to separate concerns and improve maintainability:

-   **`config`**: Database connection and environment variable management.
-   **`controllers`**: Business logic for handling requests.
-   **`docs`**: Swagger API documentation setup.
-   **`middleware`**: Request processing middleware (authentication, error handling, validation).
-   **`models`**: Mongoose schemas for database models.
-   **`routes`**: Express route definitions.
-   **`services`**: Logic for interacting with external services (e.g., Stability AI).
-   **`tests`**: Jest test suites for API endpoints.
-   **`utils`**: Helper functions and utilities.

## 🚀 Deployment

This application is ready for deployment on platforms like AWS Elastic Beanstalk, Heroku, or any service that supports Node.js.

### Production Deployment Steps (Example: AWS)

1.  **Set environment to production** in your `.env` file.
2.  **Install AWS EB CLI**.
3.  **Initialize Elastic Beanstalk**: `eb init -p "Node.js" --region your-region`
4.  **Create an environment**: `eb create your-env-name`
5.  **Set environment variables** in the Elastic Beanstalk console or via the CLI.
6.  **Deploy**: `eb deploy`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
- `GET /image/history` - Get user's image generation history
- `GET /image/:id` - Get a specific generated image
- `DELETE /image/:id` - Delete a generated image

#### API Keys
- `POST /apikey/save` - Save or update Stability AI API key
- `GET /apikey/info` - Get API key info (does not expose the key)
- `DELETE /apikey/remove` - Remove API key

#### Coins
- `POST /coin/add` - Add coins by watching an ad
- `POST /coin/buy` - Purchase coins
- `GET /coin/balance` - Get current coin balance
- `GET /coin/transactions` - Get transaction history

## 🛡️ Security

### Rate Limiting
- Authentication endpoints: 50 requests per 15 minutes
- API key operations: 10 requests per hour
- Image generation: 30 requests per 15 minutes
- Coin operations: 20 requests per hour

### Input Validation
All user inputs are validated using `express-validator` to prevent injection attacks and ensure data integrity.

### Data Protection
- Passwords are hashed using bcrypt
- API keys are encrypted before storage
- Sensitive data is never logged

## 📦 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
NODE_ENV=development
PORT=8000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai_image_generator

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Stability AI
STABILITY_API_KEY=your_stability_ai_api_key
STABILITY_API_HOST=api.stability.ai

# File Upload
MAX_FILE_UPLOAD=10 # MB
FILE_UPLOAD_PATH=./public/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Deployment

### Production Deployment

1. **Set environment to production**
   ```bash
   NODE_ENV=production
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t ai-image-generator .
   ```

2. **Run the container**
   ```bash
   docker run -d -p 8000:8000 --env-file .env ai-image-generator
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stability AI](https://stability.ai/) for their amazing AI models
- [Express.js](https://expressjs.com/) for the web framework
- [MongoDB](https://www.mongodb.com/) for the database
- [Swagger](https://swagger.io/) for API documentation

### ✨ Key Features
- 🔐 **Secure Authentication** with JWT
- 🪙 **Dual Monetization**: Coin-based and subscription-based access
- 🖼️ **AI-Powered Image Generation** using Stability AI
- 📱 **Mobile-First** design with Google Play Billing integration
- ⚡ **High Performance** with optimized database queries
- 🔄 **RESTful API** design with proper status codes and error handling
  - Multiple style presets (enhance, digital-art, etc.)
  - Adjustable parameters (size, steps, CFG scale, etc.)
  - Negative prompts for better image control
  - Image history and management
  - Rate limiting and request validation

## 🔑 API Key Configuration

### Stability AI API Key
- **Automatically managed by the backend**
- No need to provide an API key in requests
- The backend uses its own Stability AI API key from environment variables
- Server admin must ensure sufficient balance for image generation

### Cost Estimates (for server admin)
- 512x512 image (10 steps): ~$0.01 USD
- 768x768 image (10 steps): ~$0.02 USD
- 1024x1024 image (10 steps): ~$0.04 USD

## 🔧 Environment Variables

This application uses environment variables for configuration. Here's a breakdown of the key variables:

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development`, `production` |
| `STABILITY_API_KEY` | Your Stability AI API key | `sk-...` |
| `PORT` | Port to run the server | `8000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT token signing | `your_secure_secret` |
| `JWT_EXPIRE` | JWT token expiration | `30d` |
| `STABILITY_API_URL` | Base URL for Stability AI | `https://api.stability.ai` |
| `COST_PER_IMAGE` | Coins deducted per image | `5` |
| `GOOGLE_PLAY_PACKAGE_NAME` | Google Play package name | `com.yourapp.package` |

### Optional Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_IMAGE_WIDTH` | `512` | Default width for generated images (SD 1.5 supports 512 or 768) |
| `DEFAULT_IMAGE_HEIGHT` | `512` | Default height for generated images (SD 1.5 supports 512 or 768) |
| `DEFAULT_CFG_SCALE` | `7` | Default CFG scale for image generation (1-35) |
| `DEFAULT_STEPS` | `30` | Default number of generation steps (10-50) |
| `DEFAULT_SAMPLES` | `1` | Default number of images to generate (1-4) |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Rate limiting window |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `UPLOAD_PATH` | `./public/uploads` | Local storage path for images |
| `MAX_FILE_UPLOAD` | `10` | Maximum file upload size in MB |

For a complete list of all available environment variables, see the [.env.example](.env.example) file.

## 🔐 Authentication API

### Register New User

**Endpoint:** `POST /api/auth/register`

Register a new user account with name, email, and password. New users receive 30 coins by default.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Field Requirements:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | ✅ | 1-50 characters, cannot be empty |
| email | string | ✅ | Must be a valid email format |
| password | string | ✅ | Minimum 6 characters |

**Notes:**
- The `name` field will be automatically trimmed of any leading/trailing spaces
- Email addresses are case-insensitive and will be converted to lowercase
- Passwords are automatically hashed before being stored

**Success Response (201 Created):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "user@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or validation failed
  ```json
  {
    "success": false,
    "message": "Please provide your name"
  }
  ```
- `400 Bad Request` - Email already registered
  ```json
  {
    "success": false,
    "message": "User already exists with this email"
  }
  ```
- `500 Internal Server Error` - Server error during registration
  ```json
  {
    "success": false,
    "message": "Server error"
  }
  ```

### Login User

**Endpoint:** `POST /api/auth/login`

Authenticate a user and get a JWT token.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "user@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get Current User

**Endpoint:** `GET /api/auth/me`

Get the currently authenticated user's profile.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "user@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## 🖼️ Image Generation API

### Generate Image

**Endpoint:** `POST /api/image/generate`

Generate AI images using text prompts with Stability AI's Stable Diffusion v1.5 model.

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains, digital art",
  "negativePrompt": "blurry, low quality, distorted",
  "width": 512,
  "height": 512,
  "samples": 1,
  "steps": 30,
  "cfgScale": 7,
  "seed": 12345
}
```

**Parameters:**
- `prompt` (string, required): Text description of the image to generate
- `negativePrompt` (string, optional): Text describing what to avoid in the image
- `width` (number, optional): Width of the generated image (512 or 768)
- `height` (number, optional): Height of the generated image (512 or 768)
- `samples` (number, optional): Number of images to generate (1-4)
- `steps` (number, optional): Number of diffusion steps (10-50)
- `cfgScale` (number, optional): How strictly the diffusion process adheres to the prompt (1-35)
- `seed` (number, optional): Random seed for reproducibility (0-4294967295)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "507f1f77bcf86cd799439011",
        "imageData": "data:image/png;base64,...",
        "imageUrl": "https://your-storage.com/images/12345.png",
        "prompt": "A beautiful sunset over mountains, digital art",
        "createdAt": "2023-04-01T12:00:00.000Z"
      }
    ],
    "coinsUsed": 5,
    "remainingCoins": 45
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Invalid or missing API key
- `402 Payment Required`: Insufficient credits
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "a beautiful sunset over mountains, digital art",
  "negativePrompt": "blurry, low quality, distorted",
  "width": 1024,
  "height": 1024,
  "samples": 1,
  "steps": 50,
  "cfgScale": 7,
  "stylePreset": "enhance",
  "seed": 12345
}
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | - | Text description of the desired image |
| negativePrompt | string | No | - | Text describing what to avoid in the image |
| width | number | No | 1024 | Width of the generated image (pixels) |
| height | number | No | 1024 | Height of the generated image (pixels) |
| samples | number | No | 1 | Number of images to generate (1-10) |
| steps | number | No | 50 | Number of diffusion steps (10-150) |
| cfgScale | number | No | 7 | How strictly to follow the prompt (0-35) |
| stylePreset | string | No | enhance | Style preset to use |
| seed | number | No | random | Random seed for reproducibility |

**Success Response (200 OK):**
```json
{
  "success": true,
  "images": [
    {
      "id": "unique-image-id",
      "url": "https://your-bucket.s3.region.amazonaws.com/path/to/image.png",
      "base64": "base64-encoded-image-data"
    }
  ],
  "coinsUsed": 10,
  "remainingCoins": 90
}
```

**Error Responses:**
- `400 Bad Request`: Invalid parameters or insufficient coins
- `401 Unauthorized`: Missing or invalid authentication
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error or API failure

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
- Node.js 18.x or later
- MongoDB 5.0 or later (MongoDB Atlas recommended)
- npm or yarn
- AWS Account (for deployment)
- AWS CLI and EB CLI (for deployment)
- Stability AI API key
- Google Play Developer account (for subscription verification)

### Environment Setup

1. **Create a `.env` file**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**
   Open `.env` and update the following required variables:
   ```
   # Required Configuration
   NODE_ENV=development
   PORT=8000
   
   # MongoDB Configuration
   MONGO_URI=your_mongodb_connection_string
   
   # JWT Configuration
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRE=30d
   
   # Stability AI Configuration
   STABILITY_API_KEY=your_stability_ai_api_key
   
   # Google Play Billing
   GOOGLE_PLAY_PACKAGE_NAME=com.yourcompany.yourapp
   ```

   For a complete list of all available configuration options, see the [Environment Variables Reference](#-environment-variables).

## 🚀 Deployment with AWS Elastic Beanstalk

### Prerequisites

1. Install AWS CLI: [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Install EB CLI:
   ```bash
   npm install -g aws-elastic-beanstalk-cli
   ```
3. Configure AWS credentials:
   ```bash
   aws configure
   ```

### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd all-in-one-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize Elastic Beanstalk**
   ```bash
   eb init -p Node.js ai-image-api --region us-east-1
   ```

5. **Create an environment**
   ```bash
   eb create ai-image-api-env
   ```

6. **Deploy your application**
   ```bash
   eb deploy
   ```

7. **Set environment variables in Elastic Beanstalk**
   ```bash
   eb setenv NODE_ENV=production MONGO_URI=your_mongodb_uri JWT_SECRET=your_jwt_secret
   ```

8. **Open the application**
   ```bash
   eb open
   ```

### Managing the Application

- **View logs**: `eb logs`
- **SSH into instance**: `eb ssh`
- **Check health**: `eb health`
- **List environments**: `eb list`
- **Terminate environment**: `eb terminate ai-image-api-env`

### Environment Variables

Copy `.env.example` to `.env` and update the values. See [Environment Variables](#environment-variables) section for details.

## 🔧 Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Start production server**
   ```bash
   npm start
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

# AWS S3 Configuration (for image storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your-s3-bucket-name
AWS_S3_BUCKET_URL=https://your-s3-bucket-name.s3.your-region.amazonaws.com
```

## ☁️ AWS S3 Configuration

### 1. Prerequisites
- AWS Account with S3 access
- IAM User with S3 permissions
- S3 Bucket created

### 2. IAM User Setup
1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the `AmazonS3FullAccess` policy (or create a custom policy with least privilege)
4. Save the Access Key ID and Secret Access Key

### 3. S3 Bucket Setup
1. Go to AWS S3 Console
2. Create a new bucket
3. Enable CORS configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```
4. Update bucket policy to allow public access if needed

### 4. Install Required Packages
```bash
npm install aws-sdk @aws-sdk/client-s3
```

### 5. S3 Upload Helper
Create `utils/s3Upload.js`:

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (fileBuffer, fileName, mimetype) => {
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
    ACL: 'public-read', // Remove this if you don't want public access
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    // Return public URL
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

module.exports = { uploadToS3 };
```

### 6. Update Image Controller
Modify your image controller to use S3:

```javascript
const { uploadToS3 } = require('../utils/s3Upload');

// In your image generation/upload function
const fileBuffer = Buffer.from(base64Data, 'base64');
const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

const imageUrl = await uploadToS3(
  fileBuffer,
  fileName,
  'image/png'
);
```

### 7. Testing the Setup
1. Set all AWS environment variables in your `.env` file
2. Restart your server
3. Test image upload functionality

### 8. Troubleshooting
- **Access Denied**: Check IAM permissions and bucket policy
- **CORS Issues**: Verify CORS configuration on the S3 bucket
- **Slow Uploads**: Consider using AWS CloudFront for CDN
- **Large Files**: Implement multipart upload for files > 5MB

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
| `POST` | `/api/image/generate` | Generate AI image (returns base64 data) | ✅ (uses server's API key) |
| `GET` | `/api/image/history` | Get generation history | ✅ |
| `GET` | `/api/image/:id` | Get specific image details | ✅ |
| `DELETE` | `/api/image/:id` | Delete generated image | ✅ |

## 📚 API Reference & Examples

### Image Generation

#### Request
```http
POST /api/image/generate
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "prompt": "a beautiful sunset over mountains, digital art",
  "stylePreset": "digital-art",
  "width": 1024,
  "height": 1024,
  "samples": 1,
  "steps": 30,
  "cfgScale": 7
}
```

#### Response (Success)
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "60a7b3c9e6b0f30015f8d9a1",
        "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
        "imageUrl": "/uploads/123e4567-e89b-12d3-a456-426614174000.png",
        "prompt": "a beautiful sunset over mountains, digital art",
        "createdAt": "2025-07-01T14:30:00.000Z"
      }
    ],
    "coinsUsed": 10,
    "remainingCoins": 990
  }
}
```

#### Frontend Usage Example
```javascript
// React component example
function GeneratedImage({ imageData, prompt }) {
  return (
    <div className="generated-image">
      <img 
        src={imageData} 
        alt={prompt}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <p>{prompt}</p>
    </div>
  );
}

// Plain HTML
/*
<div class="image-container">
  <img 
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..." 
    alt="AI generated image"
  />
</div>
*/
```

### Important Notes
- The `imageData` field contains the complete base64-encoded image data that can be directly used in an `<img>` tag
- The `imageUrl` is also provided if you need to reference the image by URL
- Base64 responses are larger than binary data, so consider this for mobile users
- For large images, you might want to use the URL approach instead

## 🧾 Subscription
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

## 📚 API Reference & Examples

### 🔐 Authentication

#### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### 👤 User Profile

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <your_jwt_token>
```

#### Update User Profile
```http
PUT /api/user/profile
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "email": "new.email@example.com",
  "name": "John Doe"
}
```

### 💰 Coin Management

#### Buy Coins
```http
POST /api/coin/buy
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "amount": 100,
  "paymentMethod": "stripe",
  "transactionId": "txn_1234567890"
}
```

#### Earn Coins
```http
POST /api/coin/earn
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "amount": 10,
  "source": "ad_watch"
}
```

### 🖼️ Image Generation

#### Generate AI Image
```http
POST /api/image/generate
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "prompt": "a beautiful sunset over mountains, digital art",
  "stylePreset": "digital-art",
  "width": 1024,
  "height": 1024,
  "samples": 1,
  "steps": 50,
  "cfgScale": 7
}
```

#### Get Image History
```http
GET /api/image/history?page=1&limit=10
Authorization: Bearer <your_jwt_token>
```

### 🧾 Subscription

#### Verify Google Play Subscription
```http
POST /api/subscription/verify
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "purchaseToken": "purchase_token_from_google_play",
  "productId": "com.yourapp.monthly_premium",
  "packageName": "com.yourapp"
}
```

#### Get Subscription Status
```http
GET /api/subscription/status
Authorization: Bearer <your_jwt_token>
```

## 🚀 Deployment

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

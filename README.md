<div align="center">
  <h1>🎨 AI Image Generation Backend</h1>
  <p>Scalable microservices backend for AI-powered image generation with coin and subscription models</p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=nodedotjs)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-5.0-47A248?logo=mongodb)](https://www.mongodb.com/)
  [![AWS Elastic Beanstalk](https://img.shields.io/badge/AWS-Elastic%20Beanstalk-FF9900?logo=amazonaws)](https://aws.amazon.com/elasticbeanstalk/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

## 📄 Description

A robust, scalable backend system for an AI-powered image generation application. This project follows a microservices architecture with separate services for authentication, user management, coin transactions, AI image generation, and subscription handling.

## 🚀 Recent Updates

### Image Generation Improvements
- **Fixed**: Empty negative prompts are now properly handled
- **Enhanced**: Better error messages for API failures
- **Improved**: Request validation and sanitization
- **Optimized**: Default values from environment variables for better configuration

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

## 🔧 Environment Variables

This application uses environment variables for configuration. Here's a breakdown of the key variables:

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development`, `production` |
| `PORT` | Port to run the server | `8000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT token signing | `your_secure_secret` |
| `JWT_EXPIRE` | JWT token expiration | `30d` |
| `STABILITY_API_KEY` | Stability AI API key | `sk-...` |
| `GOOGLE_PLAY_PACKAGE_NAME` | Google Play package name | `com.yourapp.package` |

### Optional Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_IMAGE_WIDTH` | `1024` | Default width for generated images |
| `DEFAULT_IMAGE_HEIGHT` | `1024` | Default height for generated images |
| `DEFAULT_CFG_SCALE` | `7` | Default CFG scale for image generation |
| `DEFAULT_STEPS` | `50` | Default number of generation steps |
| `DEFAULT_SAMPLES` | `1` | Default number of images to generate |
| `DEFAULT_STYLE_PRESET` | `enhance` | Default style preset |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Rate limiting window |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

For a complete list of all available environment variables, see the [.env.example](.env.example) file.

## 🔐 Authentication API

### Register New User

**Endpoint:** `POST /api/auth/register`

Register a new user account.

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

Generate AI images using text prompts with Stability AI.

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
| `POST` | `/api/image/generate` | Generate AI image (returns base64 data) | ✅ |
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

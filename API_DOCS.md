# AI Image Generation API Documentation

## Base URL
```
https://your-api-domain.com/api
```

## Authentication
This API uses JWT for authentication. Include the JWT token in the `Authorization` header for protected routes.

## Image Generation

### Generate Image
Generate an AI image using Stability AI.

**Endpoint:** `POST /image/generate`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>` (required)
- `x-stability-api-key: <STABILITY_AI_API_KEY>` (required)
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
- `negativePrompt` (string, optional): Text describing what to avoid in the image (will be combined with prompt using '###' separator)
- `width` (number, optional): Width of the generated image (must be 512 or 768)
- `height` (number, optional): Height of the generated image (must be 512 or 768)
- `samples` (number, optional): Number of images to generate (1-4, default: 1)
- `steps` (number, optional): Number of diffusion steps (10-50, default: 30)
- `cfgScale` (number, optional): How strictly the diffusion process adheres to the prompt (1-35, default: 7)
- `seed` (number, optional): Random seed for reproducibility (0-4294967295)

**Note:** This endpoint uses Stable Diffusion 1.5 model which is more cost-effective but has some limitations compared to newer models. For best results, use square images (512x512 or 768x768).

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
    "coinsUsed": 10,
    "remainingCoins": 90
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Invalid or missing API key
- `402 Payment Required`: Insufficient credits
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Authentication

### Register
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login
Authenticate and get JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Get Current User
Get current authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

## Error Handling
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

## Rate Limiting
- 60 requests per minute per IP address
- Additional rate limits may apply based on your subscription plan

## Getting a Stability AI API Key
1. Sign up at https://stability.ai/
2. Go to the API Keys section in your account dashboard
3. Create a new API key
4. Use this key in the `x-stability-api-key` header for image generation requests

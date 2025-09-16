# Xeno CRM API Documentation

## Overview

The Xeno CRM API provides comprehensive endpoints for customer management, segmentation, campaign management, and AI-powered features. The API is fully documented using OpenAPI 3.0 specification and accessible through Swagger UI.

## Accessing the API Documentation

### Production Environment
- **Swagger UI**: https://backend-production-05a7e.up.railway.app/api/docs
- **Alternative URL**: https://backend-production-05a7e.up.railway.app/docs

### Development Environment
- **Swagger UI**: http://localhost:3001/api/docs
- **Alternative URL**: http://localhost:3001/docs

## API Features

### 🔐 Authentication
- **Google OAuth 2.0**: Secure authentication using Google accounts
- **JWT Tokens**: Stateless authentication with JSON Web Tokens
- **Protected Endpoints**: All API endpoints require valid authentication

### 📊 Core Entities

#### Customer Management
- **GET** `/api/v1/customers` - List all customers
- **POST** `/api/v1/customers` - Create new customer
- **GET** `/api/v1/customers/{id}` - Get customer by ID
- **PUT** `/api/v1/customers/{id}` - Update customer
- **DELETE** `/api/v1/customers/{id}` - Delete customer
- **GET** `/api/v1/customers/analytics` - Get customer analytics

#### Segment Management
- **GET** `/api/v1/segments` - List all segments
- **POST** `/api/v1/segments` - Create new segment
- **GET** `/api/v1/segments/{id}` - Get segment by ID
- **PUT** `/api/v1/segments/{id}` - Update segment
- **DELETE** `/api/v1/segments/{id}` - Delete segment
- **POST** `/api/v1/segments/preview` - Preview segment count

#### Campaign Management
- **GET** `/api/v1/campaigns` - List all campaigns
- **POST** `/api/v1/campaigns` - Create new campaign
- **GET** `/api/v1/campaigns/{id}` - Get campaign by ID
- **PUT** `/api/v1/campaigns/{id}` - Update campaign
- **DELETE** `/api/v1/campaigns/{id}` - Delete campaign

#### Order Management
- **GET** `/api/v1/orders` - List all orders
- **POST** `/api/v1/orders` - Create new order
- **GET** `/api/v1/orders/{id}` - Get order by ID
- **PUT** `/api/v1/orders/{id}` - Update order
- **DELETE** `/api/v1/orders/{id}` - Delete order
- **GET** `/api/v1/orders/trends` - Get revenue trends

### 🤖 AI-Powered Features

#### AI Segmentation
- **POST** `/api/v1/ai/nl-to-segment` - Convert natural language to segment rules
- **POST** `/api/v1/ai/message-variants` - Generate message variants
- **GET** `/api/v1/ai/analytics` - Get AI-powered analytics insights
- **GET** `/api/v1/ai/dashboard-insights` - Get comprehensive dashboard insights

## Data Schemas

### Customer Schema
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string (email format)",
  "phone": "string",
  "visits": "integer (minimum: 0)",
  "tags": ["string"],
  "lastOrderAt": "string (date-time)",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

### Segment Schema
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "rules": [
    {
      "field": "string",
      "operator": "string",
      "value": "string"
    }
  ],
  "customerCount": "integer (minimum: 0)",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

### Campaign Schema
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "type": "string (enum: email, sms, push, social)",
  "status": "string (enum: draft, scheduled, active, paused, completed, cancelled)",
  "segmentId": "string",
  "message": "string",
  "sentCount": "integer (minimum: 0)",
  "openRate": "number (0-100)",
  "clickRate": "number (0-100)",
  "scheduledAt": "string (date-time)",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

### Order Schema
```json
{
  "_id": "string",
  "customerId": "string",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": "integer (minimum: 1)",
      "price": "number (minimum: 0)"
    }
  ],
  "totalAmount": "number (minimum: 0)",
  "status": "string (enum: pending, confirmed, shipped, delivered, cancelled, refunded)",
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "paymentMethod": "string",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
```

## Authentication

### Getting Started
1. **Register/Login**: Use Google OAuth through the frontend
2. **Get JWT Token**: After successful authentication, you'll receive a JWT token
3. **Include in Requests**: Add the token to the `Authorization` header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Example Request
```bash
curl -X GET "https://backend-production-05a7e.up.railway.app/api/v1/customers" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

## Interactive Testing

The Swagger UI provides interactive testing capabilities:

1. **Browse Endpoints**: Navigate through all available endpoints
2. **View Schemas**: See detailed request/response schemas
3. **Try It Out**: Test endpoints directly from the browser
4. **Authentication**: Use the "Authorize" button to set your JWT token
5. **Copy cURL**: Generate cURL commands for your requests

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "error": "Validation failed",
  "message": "Email is required",
  "statusCode": 400
}
```

## Rate Limiting

- **Rate Limit**: 100 requests per minute per IP
- **Burst Limit**: 20 requests per second
- **Headers**: Rate limit information is included in response headers

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Support

For API support and questions:
- **Email**: support@xenocrm.com
- **Documentation**: Available in Swagger UI
- **Status**: Check `/health` endpoint for API status

## Changelog

### Version 1.0.0
- Initial API release
- Complete CRUD operations for all entities
- AI-powered segmentation and campaign generation
- Google OAuth authentication
- Comprehensive Swagger documentation
- Interactive API testing interface

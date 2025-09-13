# 🚀 Xeno CRM - AI-Powered Customer Relationship Management System

A comprehensive, full-stack CRM application built with Next.js, Express.js, MongoDB, and AI-powered features for intelligent customer segmentation, campaign management, and analytics.

## ✨ Features

### 🤖 AI-Powered Features
- **Smart Segment Creation**: Natural language to segment rules conversion
- **AI Message Generator**: Intelligent campaign message and variant generation
- **AI Analytics Dashboard**: Real-time insights with interactive charts and graphs
- **Smart Personalization**: Dynamic message personalization based on customer data

### 📊 Core CRM Functionality
- **Customer Management**: Complete customer lifecycle management
- **Order Management**: Order tracking and customer spending analysis
- **Campaign Management**: Email/SMS campaign creation and delivery
- **Segment Management**: Advanced customer segmentation with preview
- **Campaign History**: Comprehensive campaign performance tracking

### 📈 Analytics & Insights
- **Real-time Dashboard**: Live statistics and performance metrics
- **Interactive Charts**: Customer segments, campaign performance, revenue trends
- **AI Insights**: Intelligent recommendations and warnings
- **Growth Tracking**: Customer acquisition and revenue trend analysis

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Authentication**: NextAuth.js with Google OAuth

### Backend (Express.js)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Queue System**: RabbitMQ for asynchronous processing
- **AI Integration**: OpenAI API with smart mock responses
- **API Documentation**: Swagger/OpenAPI

### Microservices
- **Worker Service**: Background job processing
- **Vendor Simulator**: Mock external service for message delivery
- **Message Queue**: RabbitMQ for reliable message processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- RabbitMQ (local or cloud)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd CRM_XENO
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install worker dependencies
cd ../worker && npm install

# Install vendor simulator dependencies
cd ../vendor-simulator && npm install
```

3. **Environment Setup**
Create `.env` files in each service directory:

**Backend (.env)**
```env
MONGO_URI=mongodb://localhost:27017/xeno-crm
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
BACKEND_URL=http://localhost:3001
VENDOR_URL=http://localhost:3002
RABBITMQ_URL=amqp://localhost:5672
```

4. **Start Services**

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Worker**
```bash
cd worker
npm run dev
```

**Terminal 4 - Vendor Simulator**
```bash
cd vendor-simulator
npm run dev
```

## 📱 Usage

### Dashboard
- Access the main dashboard at `http://localhost:3000`
- View real-time analytics and AI insights
- Monitor customer, campaign, and order statistics

### Customer Management
- Add, edit, and manage customer profiles
- Track customer spending and behavior
- View customer segments and tags

### Campaign Management
- Create targeted email/SMS campaigns
- Use AI to generate message variants
- Track delivery rates and performance
- View campaign history and analytics

### Order Management
- Process customer orders
- Track revenue and spending patterns
- Automatically update customer total spend

### Segment Management
- Create customer segments using natural language
- Preview audience size before saving
- Use AI to generate segment rules

## 🔧 API Endpoints

### Core APIs
- `GET /api/v1/customers` - List customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/campaigns` - List campaigns
- `POST /api/v1/campaigns` - Create campaign
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order

### AI APIs
- `POST /api/v1/ai/nl-to-segment` - Convert natural language to segment rules
- `POST /api/v1/ai/message-variants` - Generate message variants
- `GET /api/v1/ai/analytics` - Get AI-powered analytics

### Documentation
- API Documentation: `http://localhost:3001/api/docs`

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Consistent design system
- **Interactive Charts**: Real-time data visualization
- **Sidebar Navigation**: Intuitive navigation structure
- **Loading States**: Smooth user experience
- **Error Handling**: Comprehensive error management

## 🔒 Security

- **Authentication**: Google OAuth integration
- **Data Validation**: Zod schema validation
- **CORS Protection**: Cross-origin request security
- **Input Sanitization**: XSS protection
- **Rate Limiting**: API request throttling

## 📊 Database Schema

### Customer
```typescript
{
  firstName: string
  lastName: string
  email: string
  phone?: string
  totalSpend: number
  visits: number
  lastOrderAt?: Date
  tags: string[]
}
```

### Campaign
```typescript
{
  name: string
  description?: string
  segmentId: string
  message: string
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed'
  stats: {
    totalRecipients: number
    sent: number
    delivered: number
    failed: number
    bounced: number
  }
}
```

### Order
```typescript
{
  orderId: string
  customerName: string
  totalSpent: number
  date: Date
}
```

## 🤖 AI Features

### Smart Segment Creation
- Natural language input: "Customers who spent more than $1000"
- AI generates segment rules automatically
- Preview audience size before saving

### Message Generation
- Campaign objective and tone input
- AI generates multiple message variants
- Personalized content based on customer data

### Analytics Insights
- Automatic trend detection
- Performance recommendations
- Warning alerts for low performance
- Growth pattern analysis

## 🚀 Deployment

### Production Environment
1. Set up MongoDB Atlas or production MongoDB
2. Configure RabbitMQ cloud service
3. Set up environment variables
4. Deploy backend to your preferred platform
5. Deploy frontend to Vercel/Netlify
6. Configure domain and SSL certificates

### Docker Support
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Express.js for the robust backend
- MongoDB for the flexible database
- OpenAI for AI capabilities
- Recharts for beautiful visualizations

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Next.js, Express.js, MongoDB, and AI**
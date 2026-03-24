# Cribtopia Test Environment

FSBO (For Sale By Owner) real estate platform test environment with Docker.

## 🏠 Features

- **Property Listings** - Create, browse, and search property listings
- **Photo Gallery** - Upload up to 20 photos per listing with navigation
- **Video Tours** - Upload 60-second video tours
- **Google Maps Integration** - Live map preview when creating listings
- **Offer System** - Buyers can submit offers on properties
- **Zillow-Style Details** - Facts, features, neighborhood info
- **Mobile Responsive** - Works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Vite |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Containerization** | Docker Compose |

## 🚀 Quick Start

### Prerequisites

- Docker Desktop
- Docker Compose

### Run Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cribtopia-test.git
cd cribtopia-test

# Start all services
docker compose up -d

# Access the app
open http://localhost:5173
```

### Access Points

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3000 |
| **PostgreSQL** | localhost:5432 |

## 📁 Project Structure

```
cribtopia-test/
├── src/                    # React frontend
│   ├── pages/
│   │   ├── Home.jsx        # Property listings
│   │   ├── SellerDashboard.jsx
│   │   ├── BuyerDashboard.jsx
│   │   └── ...
│   ├── App.jsx
│   └── main.jsx
├── backend/                # Node.js API
│   ├── server.js           # Express server
│   └── package.json
├── database/               # PostgreSQL
│   └── init.sql            # Schema + seed data
├── docker-compose.yml
├── Dockerfile              # Frontend
└── package.json
```

## 🔧 Configuration

### Database Credentials

| Setting | Value |
|---------|-------|
| Host | postgres |
| Port | 5432 |
| Database | cribtopia |
| User | cribtopia |
| Password | cribtopia_secret_2024 |

### Environment Variables

Create a `.env` file for custom configuration:

```env
DATABASE_URL=postgres://cribtopia:cribtopia_secret_2024@postgres:5432/cribtopia
PORT=3000
```

## 📱 Pages

| Page | Description |
|------|-------------|
| **Home** | Browse listings with search and filters |
| **Seller Dashboard** | Create and manage listings |
| **Buyer Dashboard** | Browse and make offers |
| **Contract Drafter** | Generate contracts (coming soon) |
| **FAQ Assistant** | Common questions |

## 🗄️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/listings` | GET | Get all listings |
| `/api/listings` | POST | Create new listing |
| `/api/listings/:id` | GET | Get single listing |
| `/api/upload` | POST | Upload photos |
| `/api/upload/video` | POST | Upload video |
| `/api/offers` | GET | Get all offers |
| `/api/offers` | POST | Create offer |

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
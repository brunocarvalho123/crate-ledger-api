# 📊 Backend for the CrateLedger App

A simple Node.js + TypeScript backend for a personal finance app that helps users track all types of assets — from stocks, crypto, and ETFs to real estate, cars, and fiat.  
No accounts required. Data is designed to be private and synced via iCloud (on the frontend).

## ⚙️ Stack

- **Node.js** with **Express**
- **TypeScript**
- **Jest** (for testing)
- **MongoDB** with Mongoose
- **Docker** (for deployment)
- **Fly.io** (planned hosting)

## 📁 Project Structure

```
src/
├── controllers/      # Business logic
├── jobs/             # Functions that run on a setTimeout
├── middleware/       # Custom middleware and middlware related code
├── services/         # Code to deal with 3rd party APIs
├── models/           # Mongoose models
├── routes/           # Express routes
├── types/            # Custom TypeScript types
├── utils/            # Utility functions
└── index.ts          # App entry point
tests/                # Unit tests using jest
```

## 🛠️ Setup

### 1. Clone the Repo

```bash
git clone https://github.com/brunocarvalho123/crate-ledger-api.git
cd crate-ledger-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a `.env` File

```env
PORT=3000
COINCAP_API_TOKEN=xxxx
COINGECKO_API_TOKEN=xxxx
FMP_API_TOKEN=xxxx
POLYGON_API_TOKEN=xxxx
METALPRICES_API_TOKEN=xxxx
MONGODB_URI=mongodb://yourserver/....
```

### 4. Run in Development

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
npm start
```

## 🐳 Docker

To build and run the container locally:

```bash
docker build -t crate-ledger-api .
docker run -p 3000:3000 crate-ledger-api
```

## 🚧 Current Endpoints

- `GET /assets/crypto_BTC` – Get a single asset
- `GET /assets/query?symbol=crypto_BTC,stock_AAPL` – Get requested assets
- `GET /assets/search?query=bitcoin&type=crypto` – Search for assets
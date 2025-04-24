# 📊 Backend for the CrateLedger App

A simple Node.js + TypeScript backend for a personal finance app that helps users track all types of assets — from stocks, crypto, and ETFs to real estate, cars, and fiat.  
No accounts required. Data is designed to be private and synced via iCloud (on the frontend).

## ⚙️ Stack

- **Node.js** with **Express**
- **TypeScript**
- **MongoDB** with Mongoose
- **Docker** (for deployment)
- **Fly.io** (planned hosting)

## 📁 Project Structure

```
src/
├── config/           # Configuration and DB connection
├── controllers/      # Business logic
├── models/           # Mongoose models
├── routes/           # Express routes
├── types/            # Custom TypeScript types
├── utils/            # Utility functions (TBD)
└── index.ts          # App entry point
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

- `GET /assets` – Get all assets
- `POST /assets` – Add a new asset

More to come: asset price tracking, value overrides, and more asset types.
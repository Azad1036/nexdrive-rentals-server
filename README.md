# 🚗 NextDrive Rentals - Car Rental Platform (Backend)

This is the **backend** of the NextDrive Rentals platform, built with Node.js, Express.js, and MongoDB. It supports core functionality such as car listing management, bookings, authentication, and secure APIs for frontend integration.

🌐 **[Live Site URL](https://next-zen.web.app/)**  
🗃️ **[Client Repo](https://github.com/Azad1036/Next-Zen-Client)**  
🛠️ **Backend Repo**: `<your-backend-repo-url>`

---

## 📝 Project Overview

The backend is designed to fulfill the **Assignment Category 15** requirements for a car rental platform. It includes RESTful API endpoints for managing cars, users, bookings, and authentication, with environment-based security and robust error handling.

---

## ✨ Key Backend Features

- **RESTful APIs**: For cars, users, bookings, authentication.
- **MongoDB Database**: Stores car listings, user info, and booking records.
- **Express.js**: Server framework handling routing and middleware.
- **Firebase Admin**: Used for user verification.
- **CORS + dotenv**: Secure and environment-based configuration.
- **CRUD Functionalities**: Add, update, delete cars and manage bookings.
- **Sorting & Filtering**: Available on server endpoints.
- **Search API**: Cars can be searched by model, location, or brand.
- **Booking Count**: Incremented automatically using `$inc`.
- **Pagination (Optional)**: Server-side pagination on `/myCars`.

---

## 📁 API Endpoints

### 🔐 Authentication

- `POST /jwt` – Generate token (if JWT used)
- `POST /logout` – Clear session

### 🚗 Cars

- `GET /cars` – Get all available cars (with search, sort, filter)
- `GET /cars/:id` – Get details of a single car
- `POST /cars` – Add new car (auth required)
- `PATCH /cars/:id` – Update a car (auth required)
- `DELETE /cars/:id` – Delete a car (auth required)

### 📚 Bookings

- `GET /bookings?email=user@example.com` – User-specific bookings
- `POST /bookings` – Book a car
- `PATCH /bookings/:id` – Modify booking date
- `DELETE /bookings/:id` – Cancel booking

---

## 🔧 Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone <your-backend-repo-url>
   cd nextdrive-rentals-server
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Create Environment File**

   ```env
   PORT=5000
   MONGODB_URI=your_mongo_uri
   FIREBASE_TYPE=...
   FIREBASE_PROJECT_ID=...
   ```

4. **Run Locally**

   ```bash
   npm run dev
   ```

5. **Deploy to Render/Other**
   - Use `web service`
   - Add environment variables in dashboard
   - Ensure public API endpoints are accessible

---

## ✅ Assignment Compliance

- ✔️ Secure env variables (MongoDB, Firebase)
- ✔️ Backend API deployed without 500/CORS issues
- ✔️ Pagination + Search API implemented
- ✔️ `$inc` operator for booking count
- ✔️ 8+ meaningful server-side commits
- ✔️ Custom responses and status codes
- ❌ JWT not implemented (as noted)

---

## 📦 Packages Used

- **express**
- **cors**
- **mongodb**
- **dotenv**
- **firebase-admin**
- **nodemon**

---

## 📚 Useful Links

- 🔗 **Client Repo**: [https://github.com/Azad1036/Next-Zen-Client](https://github.com/Azad1036/Next-Zen-Client)
- 🔗 **Live Site**: [https://next-zen.web.app/](https://next-zen.web.app/)
- 🔗 **Backend Repo**: `<your-backend-repo-url>`

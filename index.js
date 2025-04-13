const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};

// MiddleWare
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// MongoDB Uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@firstproject.mz7uu.mongodb.net/?retryWrites=true&w=majority&appName=FirstProject`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const mongoDbServer = async () => {
  try {
    // DataBase Create MongoDB
    const database = client.db("nexDriveDB");
    const carRentalsCollection = database.collection("rentalsCar");
    const myBookingCollection = database.collection("bookingCar");

    // All Car Get in DataBase
    app.get("/all-cars", async (req, res) => {
      const searchTerm = req.query.searchTerm;
      const query = {
        carModel: {
          $regex: searchTerm,
          $options: "i",
        },
      };
      const allCars = await carRentalsCollection.find(query).toArray();
      res.send(allCars);
    });

    // Car Details View
    app.get("/car-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carRentalsCollection.findOne(query);
      res.send(result);
    });

    app.get("/recent-allCars", async (req, res) => {
      const result = await carRentalsCollection.find().limit(6).toArray();
      res.send(result);
    });

    // My Car list Collection Db
    app.get("/my-carList/:email", async (req, res) => {
      const email = req.params.email;

      const filterDate = req.query.filterDate;

      let options = {};

      // Apply filterDate if present
      if (filterDate) {
        options.currentData = filterDate === "date-asc" ? 1 : -1;
      }
      const query = { "buyer.email": email };
      const result = await carRentalsCollection
        .find(query)
        .sort(options)
        .toArray();

      res.send(result);
    });

    // My Single Car Update
    app.get("/update-car/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carRentalsCollection.findOne(query);
      res.send(result);
    });

    // Add Car For Database
    app.post("/car-added", async (req, res) => {
      const carData = req.body;
      const result = await carRentalsCollection.insertOne(carData);
      res.send(result);
    });

    // Update MyCar Data
    app.put("/update-car-details/:id", async (req, res) => {
      const updateData = req.body;
      const find = req.params.id;
      const query = { _id: new ObjectId(find) };
      const options = { upsert: true };
      const updateCarDetails = {
        $set: updateData,
      };
      const result = await carRentalsCollection.updateOne(
        query,
        updateCarDetails,
        options
      );
      res.send(result);
    });

    // Delete My Car list
    app.delete("/delete-myCar/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carRentalsCollection.deleteOne(query);
      res.send(result);
    });

    // My Booking Data Save Database
    app.post("/my-booking", async (req, res) => {
      const bookingBData = req.body;

      // Find User Only One Bit
      const query = { email: bookingBData.email, carId: bookingBData.carId };
      const alreadyExit = await myBookingCollection.findOne(query);

      if (alreadyExit)
        return res.status(400).send("You Already This Car Booking");

      // Save Dd
      const result = await myBookingCollection.insertOne(bookingBData);

      // Update Booking Count
      const filter = { _id: new ObjectId(bookingBData.carId) };
      const updateCount = {
        $inc: {
          set_count: 1,
        },
      };
      const updateBookingCount = await carRentalsCollection.updateOne(
        filter,
        updateCount
      );

      res.send(result);
    });

    // My All Booking list Api
    app.get("/my-all-booking/:email", async (req, res) => {
      const email = req.params.email;

      const isBuyer = req.query.buyer;
      let query = {};
      if (isBuyer) {
        query.buyer = email;
      } else {
        query.email = email;
      }
      const result = await myBookingCollection.find(query).toArray();
      res.send(result);
    });

    // Update Car Status
    app.patch("/update-booking-status/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const query = { _id: new ObjectId(id) };

      const update = {
        $set: { status },
      };
      const result = await myBookingCollection.updateOne(query, update);
      res.send(result);
    });

    // Update Date
    app.patch("/update-booking-date/:id", async (req, res) => {
      const date = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: date,
      };
      const result = await myBookingCollection.updateOne(query, update);
      res.send(result);
    });

    // My Booking Car Remove
    app.delete("/remove-bookingCar/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myBookingCollection.deleteOne(query);
      res.send(result);
    });

    // Manage All Booking Status;
  } catch (error) {
    console.log(error);
  }
};

mongoDbServer();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

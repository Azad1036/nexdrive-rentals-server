const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionSuccessStatus: 200,
};

// MiddleWare
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// verify jwt middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  // No Token
  if (!token) return res.status(401).send({ message: "Unknown Access" });
  jwt.verify(token, process.env.STORE_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unknown Access" });
    }
    req.user = decoded;
  });

  next();
};

// MongoDB Uri
const uri = "mongodb://localhost:27017";

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

    // jwt Token
    app.post("/jwt", async (req, res) => {
      const email = req.body;

      // create Token
      const token = jwt.sign(email, process.env.STORE_KEY, {
        expiresIn: "10d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // clear token from cookie
    app.get("/logoutCookie", async (req, res) => {
      res
        .clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

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

    // My Car list Collection Db
    app.get("/my-carList/:email", verifyToken, async (req, res) => {
      const decodedEmail = req.user?.email;
      const email = req.params.email;
      const filterDate = req.query.filterDate;
      
      // verf

      // Store Filter
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
      const result = await myBookingCollection.insertOne(bookingBData);

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

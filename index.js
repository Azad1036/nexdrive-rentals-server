const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://nexdrive-rentals.web.app/",
    "https://nexdrive-rentals.firebaseapp.com/",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working!");
});

// MongoDB Uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@firstproject.mz7uu.mongodb.net/?retryWrites=true&w=majority&appName=FirstProject`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect(); // 🟢 Important!

    const database = client.db("nexDriveDB");
    const carRentalsCollection = database.collection("rentalsCar");
    const myBookingCollection = database.collection("bookingCar");

    // ✅ All routes inside this block now
    app.get("/all-cars", async (req, res) => {
      const searchTerm = req.query.searchTerm || "";
      const query = {
        carModel: { $regex: searchTerm, $options: "i" },
      };
      const allCars = await carRentalsCollection.find(query).toArray();
      res.send(allCars);
    });

    app.get("/car-details/:id", async (req, res) => {
      const id = req.params.id;
      const result = await carRentalsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/recent-allCars", async (req, res) => {
      const result = await carRentalsCollection.find().limit(6).toArray();
      res.send(result);
    });

    app.get("/my-carList/:email", async (req, res) => {
      const email = req.params.email;
      const filterDate = req.query.filterDate;
      let options = {};
      if (filterDate) options.currentData = filterDate === "date-asc" ? 1 : -1;
      const query = { "buyer.email": email };
      const result = await carRentalsCollection
        .find(query)
        .sort(options)
        .toArray();
      res.send(result);
    });

    app.get("/update-car/:id", async (req, res) => {
      const id = req.params.id;
      const result = await carRentalsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.post("/car-added", async (req, res) => {
      const carData = req.body;
      const result = await carRentalsCollection.insertOne(carData);
      res.send(result);
    });

    app.put("/update-car-details/:id", async (req, res) => {
      const updateData = req.body;
      const find = req.params.id;
      const query = { _id: new ObjectId(find) };
      const options = { upsert: true };
      const updateCarDetails = { $set: updateData };
      const result = await carRentalsCollection.updateOne(
        query,
        updateCarDetails,
        options
      );
      res.send(result);
    });

    app.delete("/delete-myCar/:id", async (req, res) => {
      const id = req.params.id;
      const result = await carRentalsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.post("/my-booking", async (req, res) => {
      const bookingBData = req.body;
      const query = { email: bookingBData.email, carId: bookingBData.carId };
      const alreadyExit = await myBookingCollection.findOne(query);
      if (alreadyExit)
        return res.status(400).send("You Already This Car Booking");

      const result = await myBookingCollection.insertOne(bookingBData);

      const filter = { _id: new ObjectId(bookingBData.carId) };
      const updateCount = { $inc: { set_count: 1 } };
      await carRentalsCollection.updateOne(filter, updateCount);

      res.send(result);
    });

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

    app.patch("/update-booking-status/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const result = await myBookingCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      res.send(result);
    });

    app.patch("/update-booking-date/:id", async (req, res) => {
      const id = req.params.id;
      const date = req.body;
      const result = await myBookingCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: date }
      );
      res.send(result);
    });

    app.delete("/remove-bookingCar/:id", async (req, res) => {
      const id = req.params.id;
      const result = await myBookingCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // 🔥 Start server ONLY after routes are ready
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to DB or setting up routes:", error);
  }
}

run(); // 👈 This kicks off the server setup

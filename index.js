const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// username: engineering_user
// password: 9UMTD4Vv7atdcg2B

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Engineerign Workshop is Running");
});

// db users
app.listen(port, () => {
  console.log(`Engineerign Workshop is Running ${port}`);
});

// Verify JWT Token

function verifyJWT(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    // console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.371m3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client
      .db("engineeringWarkshop")
      .collection("products");
    const purchesCollection = client
      .db("engineeringWarkshop")
      .collection("purchesed");

    const userCollection = client
      .db("engineeringWarkshop")
      .collection("userInformation");

    const reviewCollection = client
      .db("engineeringWarkshop")
      .collection("review");

    // get all product and create api
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // get all product and create api
    app.post("/product", async (req, res) => {
      const addItem = req.body;
      const result = await productCollection.insertOne(addItem);
      res.send(result);
    });

    // delete prodcut to product collection

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteOrder = await productCollection.deleteOne(query);
      res.send(deleteOrder);
    });

    // get one user information
    app.get("/user/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // get all user
    app.get("/user", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = await userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get data review section
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get all order to manage order

    app.get("/allorder", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = purchesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/allorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteOrder = await purchesCollection.deleteOne(query);
      res.send(deleteOrder);
    });

    // get order to myorder route frontend

    app.get("/myorder/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = purchesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // delete myorder product

    app.delete("/myorder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteOrder = await purchesCollection.deleteOne(query);
      res.send(deleteOrder);
    });

    // get data to database spesific id product (wareHouseProduct)
    app.get("/product/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);

      res.send(result);
    });

    // add a item to main purches collection
    app.post("/purches", async (req, res) => {
      const addItem = req.body;
      const result = await purchesCollection.insertOne(addItem);
      res.send(result);
    });
    // add a review to review collection
    app.post("/review", async (req, res) => {
      const addItem = req.body;
      const result = await reviewCollection.insertOne(addItem);
      res.send(result);
    });

    // update user data

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      // upsert true dile social account diye login korrar somoy ekbar er besi email add hobe na
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);

      // send jwt token client side
      var token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10day",
      });
      res.send({ result, token });
    });

    // user admin ache kina saita check korar api

    app.get("/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.roll == "admin";
      res.send({ admin: isAdmin });
    });

    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { roll: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // ============================  Payment Mathod ==========================

    // get order to pement route

    app.get("/myorderDetails/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchesCollection.findOne(query);
      res.send(result);
    });

    // pement completed after update database purchescollection paid true

    app.patch("/myorderPement/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const peyment = req.body;
      const filter = { _id: ObjectId(id) };

      const updateDoc = {
        $set: {
          paid: true,
          transactionId: peyment.transactionId,
        },
      };
      const updatedResult = await purchesCollection.updateOne(
        filter,
        updateDoc
      );

      res.send(updateDoc);
    });

    // pement inegration
    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const service = req.body;
      const price = service.price;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });
  } finally {
  }
}

run().catch(console.dir());

const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;
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

    // get one user information
    app.get("/user/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // get purches order and create api

    app.get("/myorder", verifyJWT, async (req, res) => {
      const query = {};
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
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // add a item to main product collection
    app.post("/product", async (req, res) => {
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
  } finally {
  }
}

run().catch(console.dir());

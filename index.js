const express = require("express");
require("dotenv").config();
const cors = require("cors");

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

const { MongoClient, ServerApiVersion } = require("mongodb");
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

    // get all product and create api
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get one user information
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // get purches order and create api

    app.get("/myorder", async (req, res) => {
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

      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir());

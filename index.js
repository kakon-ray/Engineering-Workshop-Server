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

    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir());

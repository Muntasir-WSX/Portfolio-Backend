const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud-server.a0arf8b.mongodb.net/?retryWrites=true&w=majority&appName=simple-crud-server`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("muntasirPortfolio");
    const userCollection = db.collection("users");

    // User API (Admin Specific)
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };

      if (user.email !== "alimuntasir2001@gmail.com") {
        return res.status(403).send({ message: "Forbidden Access" });
      }

      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        const { role, ...restWithoutRole } = user;
        const result = await userCollection.updateOne(query, {
          $set: restWithoutRole,
        });
        return res.send(result);
      }

      const result = await userCollection.insertOne({ ...user, role: "admin" });
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await userCollection.findOne(query);

      const isAdmin =
        user?.role === "admin" && email === "alimuntasir2001@gmail.com";
      res.send({ admin: isAdmin });
    });

    console.log("Connected to MongoDB!");
  } finally {
    // Keep connection open
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Muntasir Portfolio Server is running...");
});

app.listen(port, () => {
  console.log(`Server is heating up at port ${port}`);
});

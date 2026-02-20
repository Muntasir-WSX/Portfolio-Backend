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
    const projectCollection = db.collection("projects");
    const educationCollection = db.collection("education");
    const experienceCollection = db.collection("experience");

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


    // Posting Project API

    app.get("/projects", async (req, res) => {
      const result = await projectCollection.find().toArray();
      res.send(result);
    });

  app.post("/projects", async (req, res) => {
  const project = req.body;
  const result = await projectCollection.insertOne(project);
  res.send(result);
});


// posting educations

app.get("/education", async (req, res) => {
  const result = await educationCollection.find().sort({ order: 1 }).toArray();
  res.send(result);
});

app.post("/education", async (req, res) => {
  const eduInfo = req.body;
  const result = await educationCollection.insertOne(eduInfo);
  res.send(result);
});

// posting experinece
app.get("/experience", async (req, res) => {
  const result = await experienceCollection.find().sort({ order: 1 }).toArray();
  res.send(result);
});

app.post("/experience", async (req, res) => {
  const expInfo = req.body;
  const result = await experienceCollection.insertOne(expInfo);
  res.send(result);
});


// delete a-z routes (projects,educations,experience)

app.delete("/projects/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await projectCollection.deleteOne(query);
  res.send(result);
});

app.delete("/education/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await educationCollection.deleteOne(query);
  res.send(result);
});

app.delete("/experience/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await experienceCollection.deleteOne(query);
  res.send(result);
});




// edit a-z (Projects,Educations)

app.patch("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedProject = req.body;
      const updateDoc = {
        $set: updatedProject,
      };
      const result = await projectCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/education/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedEdu = req.body;
  const updateDoc = {
    $set: updatedEdu,
  };
  const result = await educationCollection.updateOne(filter, updateDoc);
  res.send(result);
});

app.patch("/experience/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedExp = req.body;
  const updateDoc = {
    $set: updatedExp,
  };
  const result = await experienceCollection.updateOne(filter, updateDoc);
  res.send(result);
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

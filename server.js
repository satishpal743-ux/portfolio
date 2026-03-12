require("node:dns/promises").setServers(["1.1.1.1","8.8.8.8"]);
require("dotenv").config();
console.log("✅.env loaded");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(".")); // Serve frontend files

/* ================= MONGODB ATLAS CONNECTION ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully!"))
  .catch((err) =>console.log("❌ MongoDB Atlas Connection Error:", err.message)
  );

/* ================= MONGODB SCHEMA & MODEL ================= */
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

/* ================= ROUTES ================= */

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Contact form submission → SAVE TO MONGODB ATLAS
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).send("All fields are required");
    }

    await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    console.log(`✅ New contact saved: ${email}`);
   res.status(201).json({
  success: true,
  email: email,
  message: "Message saved successfully!",
});
  } catch (err) {
    console.error("❌ Error saving contact:", err.message);
    res.status(500).send("Server error. Please try again later.");
  }
});

// Fetch all contacts (ADMIN / TEST)
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    console.error("❌ Error fetching contacts:", err.message);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("Route not found");
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`\n📡 Ready to accept connections...\n`);
});
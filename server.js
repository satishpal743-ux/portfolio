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
  .then(() => {
    console.log("✅ MongoDB Atlas Connected Successfully!");
    seedAchievements();
  })
  .catch((err) => console.log("❌ MongoDB Atlas Connection Error:", err.message));

const defaultAchievements = [
  { title: "AI/ML Projects Completed", description: "Successfully completed multiple projects in Artificial Intelligence and Machine Learning.", date: "2024-2026" },
  { title: "Academic Excellence", description: "Achieved top performance in academic coursework and practical implementations.", date: "2025" },
  { title: "Certified Courses", description: "Completed certified courses in AI, ML, and Web Development from recognized platforms.", date: "2024" },
  { title: "Events & Hackathons", description: "Participated in technical events, workshops, and hackathons to enhance skills.", date: "2024-2026" },
  { title: "Continuous Learning", description: "Continuously learning and improving through hands-on projects and real-world applications.", date: "Ongoing" },
];

const defaultProfile = {
  name: "Satish Pal S",
  title: "Machine Learning Engineer (Aspiring)",
  about: "I am pursuing BSc in Artificial Intelligence and Machine Learning. I aspire to become a Machine Learning Engineer and enjoy solving problems using programming and data.",
  location: "India",
  email: "25aimb51@kristujayanti.com",
  phone: "+91 8951562844",
  github: "https://github.com/satishpal743-ux/Satish-Portfolio",
  skills: [
    { name: "C Programming", icon: "fa-solid fa-c" },
    { name: "Python", icon: "fa-brands fa-python" },
    { name: "Data Structures", icon: "fa-solid fa-database" },
    { name: "R Language", icon: "fa-brands fa-r-project" },
    { name: "HTML & CSS", icon: "fa-brands fa-html5" },
    { name: "AIML Basics", icon: "fa-solid fa-brain" },
    { name: "MongoDB", icon: "fa-solid fa-database" },
    { name: "Node.js", icon: "fa-brands fa-node-js" }
  ],
  resumeUrl: "/resume.pdf.pdf",
  photoUrl: "/photoo.jpg.jpg",
};

async function seedAchievements() {
  try {
    const count = await Achievement.countDocuments();
    if (count === 0) {
      await Achievement.insertMany(defaultAchievements);
      console.log("✅ Seeded achievements");
    }

    const portfolio = await Profile.findOne({ section: "portfolio" });
    if (!portfolio) {
      await Profile.create({ section: "portfolio", payload: defaultProfile });
      console.log("✅ Seeded profile data");
    }
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
  }
}

/* ================= MONGODB SCHEMA & MODEL ================= */
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String },
  },
  { timestamps: true }
);

const profileSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
const Achievement = mongoose.model("Achievement", achievementSchema);
const Profile = mongoose.model("Profile", profileSchema);

const profileData = {
  name: "Satish Pal S",
  title: "Machine Learning Engineer (Aspiring)",
  about: "I am pursuing BSc in Artificial Intelligence and Machine Learning. I aspire to become a Machine Learning Engineer and enjoy solving problems using programming and data.",
  location: "India",
  email: "25aimb51@kristujayanti.com",
  phone: "+91 8951562844",
  github: "https://github.com/satishpal743-ux/Satish-Portfolio",
  photoUrl: "photoo.jpg.jpg",
  resumeUrl: "resume.pdf.pdf",
  skills: ["C Programming", "Python", "Data Structures", "R Language", "HTML & CSS", "AIML Basics", "MongoDB", "Node.js"],
};

/* ================= ROUTES ================= */

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Profile route
app.get("/profile", (req, res) => {
  res.json({ success: true, profile: profileData });
});

// Achievements route
app.get("/achievements", async (req, res) => {
  try {
    let achievements = await Achievement.find().sort({ createdAt: -1 });

    // Create defaults if none exist
    if (!achievements.length) {
      const defaults = [
        { title: "AI/ML Project Completion", date: "2025", description: "Successfully completed multiple projects in Artificial Intelligence and Machine Learning." },
        { title: "Top Academic Performance", date: "2025", description: "Achieved top performance in academic coursework and practical implementations." },
        { title: "Certified Courses", date: "2024", description: "Completed certified courses in AI, ML, and Web Development from recognized platforms." },
        { title: "Tech Events & Hackathons", date: "2024", description: "Participated in technical events, workshops, and hackathons to enhance skills." },
        { title: "Continuous Learning", date: "Ongoing", description: "Continuously learning and improving through hands-on projects and real-world applications." },
      ];
      achievements = await Achievement.insertMany(defaults);
    }

    res.json({ success: true, achievements });
  } catch (err) {
    console.error("❌ Error fetching achievements:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch achievements" });
  }
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

// Fetch achievements
app.get("/achievements", async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ createdAt: -1 });
    res.json({ success: true, achievements });
  } catch (err) {
    console.error("❌ Error fetching achievements:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch achievements" });
  }
});

// Profile data (skills, about, resume, photo)
app.get("/profile", async (req, res) => {
  try {
    const profile = await Profile.findOne({ section: "portfolio" });
    res.json({ success: true, profile: profile ? profile.payload : defaultProfile });
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
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

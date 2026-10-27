
require("dotenv").config();

const OpenAI = require("openai");

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const healthInformationRoutes = require("./routes/healthInformationRoutes");
const authRoutes = require("./routes/authRoutes");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

app.use(cors());
app.use(express.json());


app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: "Your question must be 2000 characters or fewer."
      });
    }

    const result = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      messages: [
        {
          role: "system",
          content: `You are the Maasin HealthLine health information assistant.
Answer in simple, respectful language.
Explain general health topics and health center services.
Do not diagnose illnesses or prescribe medication.
Do not invent clinic schedules, prices, or policies.
For emergencies, advise the user to seek immediate medical care.
Encourage users not to share personal or identifying medical information.`
        },
        {
          role: "user",
          content: message.trim()
        }
      ]
    });

    const reply = result.choices[0]?.message?.content;

    res.json({
      reply:
        typeof reply === "string" && reply.trim()
          ? reply
          : "Sorry, I could not generate a response. Please try again."
    });
  } catch (error) {
    console.error("OpenRouter chatbot error:", error.message);

    res.status(500).json({
      error: "The chatbot is temporarily unavailable. Please try again."
    });
  }
});


app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/health-information", healthInformationRoutes);

// Check backend and database status
app.get("/api/health", (req, res) => {
  res.json({
    message: "Maasin HealthLine backend is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Maasin HealthLine API!");
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing from your .env file");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully!");

    // Create the initial administrator using username and password.
const adminUsername = String(
  process.env.ADMIN_USERNAME || ""
).trim();

const adminPassword = String(
  process.env.ADMIN_PASSWORD || ""
);

if (adminUsername && adminPassword) {
  const existingAdmin = await User.findOne({
    username: adminUsername
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await User.create({
      username: adminUsername,
      name: "Administrator",
      passwordHash,
      role: "admin"
    });

    console.log(
      `Initial administrator created for ${adminUsername}`
    );
  } else {
    console.log(
      `Administrator "${adminUsername}" already exists`
    );
  }
} else {
  console.warn(
    "ADMIN_USERNAME/ADMIN_PASSWORD are not set; configure them in .env to create the initial administrator."
  );
}

    app.listen(PORT, () => {
      console.log(
        `Maasin HealthLine running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

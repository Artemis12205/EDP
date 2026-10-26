const mongoose = require("mongoose");

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const MONGO_URI =
  process.env.MONGODB_URI;


// Define schemas
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  duration: Number,
  isActive: { type: Boolean, default: true }
});

const patientSchema = new mongoose.Schema({
  patientCode: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: Number,
  sex: String,
  contactNumber: String
});

const appointmentSchema = new mongoose.Schema({
  appointmentCode: { type: String, required: true, unique: true },
  patientName: String,
  serviceName: String,
  appointmentDate: Date,
  appointmentTime: String,
  status: {
    type: String,
    enum: ["Pending", "Approved", "Completed", "Cancelled"],
    default: "Pending"
  }
});

const healthInfoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  content: String,
  published: { type: Boolean, default: true }
});

// Models
const Service = mongoose.model("Service", serviceSchema);
const Patient = mongoose.model("Patient", patientSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const HealthInfo = mongoose.model("HealthInfo", healthInfoSchema);

// Sample seed data
async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // Replace existing seed collections with sample data.
    // WARNING: This deletes ALL documents in these four collections.
    await Promise.all([
      Service.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      HealthInfo.deleteMany({})
    ]);

    await Service.insertMany([
      {
        name: "General Consultation",
        description: "Basic health assessment and medical consultation.",
        category: "Consultation",
        duration: 30
      },
      {
        name: "Maternal Health Services",
        description: "Prenatal care and maternal health guidance.",
        category: "Maternal Health",
        duration: 45
      },
      {
        name: "Immunization",
        description: "Vaccination services based on health center schedules.",
        category: "Preventive Care",
        duration: 20
      },
      {
        name: "Dental Services",
        description: "Basic oral health assessment and dental guidance.",
        category: "Dental",
        duration: 30
      },
      {
        name: "Child Health Checkup",
        description: "Routine child growth and wellness assessment.",
        category: "Child Health",
        duration: 30
      }
    ]);

    // Fictional demo records only — not real patient information.
    await Patient.insertMany([
      {
        patientCode: "DEMO-P001",
        firstName: "Juan",
        lastName: "Dela Cruz",
        age: 25,
        sex: "Male",
        contactNumber: "DEMO-0001"
      },
      {
        patientCode: "DEMO-P002",
        firstName: "Maria",
        lastName: "Santos",
        age: 30,
        sex: "Female",
        contactNumber: "DEMO-0002"
      }
    ]);

    await Appointment.insertMany([
      {
        appointmentCode: "DEMO-A001",
        patientName: "Juan Dela Cruz",
        serviceName: "General Consultation",
        appointmentDate: new Date("2026-11-05T00:00:00"),
        appointmentTime: "09:00 AM",
        status: "Pending"
      },
      {
        appointmentCode: "DEMO-A002",
        patientName: "Maria Santos",
        serviceName: "Maternal Health Services",
        appointmentDate: new Date("2026-11-06T00:00:00"),
        appointmentTime: "10:00 AM",
        status: "Approved"
      }
    ]);

    await HealthInfo.insertMany([
      {
        title: "Importance of Handwashing",
        category: "Health Education",
        content:
          "Wash your hands with soap and clean water to help prevent the spread of infections.",
        published: true
      },
      {
        title: "Healthy Eating Habits",
        category: "Nutrition",
        content:
          "Eat a balanced diet that includes vegetables, fruits, protein, and other nutritious foods.",
        published: true
      },
      {
        title: "Regular Health Checkups",
        category: "Prevention",
        content:
          "Regular checkups can help identify health concerns early. Consult qualified health professionals for personal medical advice.",
        published: true
      }
    ]);

    console.log("Seed completed successfully!");
    console.log("Services:", await Service.countDocuments());
    console.log("Patients:", await Patient.countDocuments());
    console.log("Appointments:", await Appointment.countDocuments());
    console.log("Health information:", await HealthInfo.countDocuments());
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();

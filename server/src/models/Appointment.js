const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const appointmentSchema = new mongoose.Schema({
    appointmentCode: {
      type: String,
      unique: true,
      default: () => `APT-${randomUUID()}`
    },

    patientName: {
      type: String,
      required: true,
      trim: true
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true
    },
    service: {
      type: String,
      required: true,
      trim: true
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
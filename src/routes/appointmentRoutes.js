const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// POST /api/appointments
router.post("/", async (req, res) => {
  try {
    const {
      patientName,
      contactNumber,
      service,
      appointmentDate,
      notes
    } = req.body;

    if (
      !patientName?.trim() ||
      !contactNumber?.trim() ||
      !service?.trim() ||
      !appointmentDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields."
      });
    }

    const appointment = await Appointment.create({
      patientName,
      contactNumber,
      service,
      appointmentDate,
      notes: notes || ""
    });

    res.status(201).json({
      success: true,
      message: "Appointment submitted successfully!",
      data: appointment
    });
  } catch (error) {
    console.error("Appointment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to save appointment."
    });
  }
});

// GET /api/appointments
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({
      createdAt: -1
    });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments."
    });
  }
});

// PUT /api/appointments/:id
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID." });
    }
    const { patientName, contactNumber, service, appointmentDate, notes, status } = req.body;
    if (!patientName?.trim() || !contactNumber?.trim() || !service?.trim() || !appointmentDate) {
      return res.status(400).json({ success: false, message: "Please complete all required fields." });
    }
    const allowedStatuses = ["Pending", "Approved", "Completed", "Cancelled"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid appointment status." });
    }
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { patientName: patientName.trim(), contactNumber: contactNumber.trim(), service: service.trim(), appointmentDate, notes: notes || "", ...(status ? { status } : {}) },
      { new: true, runValidators: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });
    res.json({ success: true, message: "Appointment updated successfully.", data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update appointment.", error: error.message });
  }
});

// DELETE /api/appointments/:id
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID." });
    }
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });
    res.json({ success: true, message: "Appointment deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete appointment." });
  }
});

module.exports = router;
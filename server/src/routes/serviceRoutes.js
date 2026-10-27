
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const Service =
  mongoose.models.Service ||
  mongoose.model("Service", serviceSchema);

router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const services = await Service.find(filter);

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve services",
      error: error.message
    });
  }
});

// GET /api/services/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID."
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found."
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve service",
      error: error.message
    });
  }
});

// POST /api/services
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const service = await Service.create({
      name: req.body.name,
      description: req.body.description || "",
      isActive: req.body.isActive ?? true
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create service",
      error: error.message
    });
  }
});

// PUT /api/services/:id
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid service ID." });
    }
    const { name, description, isActive } = req.body;
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Service name is required." });
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), description: String(description || "").trim(), isActive: isActive ?? true },
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ success: false, message: "Service not found." });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update service.", error: error.message });
  }
});

// DELETE /api/services/:id
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid service ID." });
    }
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found." });
    res.json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete service." });
  }
});

module.exports = router;

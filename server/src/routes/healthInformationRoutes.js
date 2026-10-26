const express = require("express");
const mongoose = require("mongoose");
const HealthInformation = require("../models/HealthInformation");

const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// GET /api/health-information?search=wellness
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search
      ? { $or: [
          { title: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } }
        ] }
      : {};
    const articles = await HealthInformation.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: articles.length, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve health information." });
  }
});

// GET /api/health-information/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid article ID." });
    }
    const article = await HealthInformation.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Health information article not found." });
    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve health information." });
  }
});

// POST /api/health-information
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, category, content, isPublished } = req.body;
    if (!title?.trim() || !category?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Title, category, and content are required." });
    }
    const article = await HealthInformation.create({ title: title.trim(), category: category.trim(), content: content.trim(), isPublished: isPublished ?? true });
    res.status(201).json({ success: true, message: "Health article created successfully.", data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to create health article.", error: error.message });
  }
});

// PUT /api/health-information/:id
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid article ID." });
    }
    const { title, category, content, isPublished } = req.body;
    if (!title?.trim() || !category?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Title, category, and content are required." });
    }
    const article = await HealthInformation.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), category: category.trim(), content: content.trim(), isPublished: isPublished ?? true },
      { new: true, runValidators: true }
    );
    if (!article) return res.status(404).json({ success: false, message: "Health information article not found." });
    res.json({ success: true, message: "Health article updated successfully.", data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update health article.", error: error.message });
  }
});

// DELETE /api/health-information/:id
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid article ID." });
    }
    const article = await HealthInformation.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Health information article not found." });
    res.json({ success: true, message: "Health article deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete health article." });
  }
});

module.exports = router;

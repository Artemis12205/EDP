const express = require("express");
const router = express.Router();
const { projects } = require("../data/sampleData");

// GET /api/projects - list all projects
router.get("/", (req, res) => {
  res.json({ success: true, count: projects.length, data: projects });
});

// GET /api/projects/:id - get one project by ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, message: "Project ID must be a number." });
  }

  const project = projects.find((item) => item.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found." });
  }

  return res.json({ success: true, data: project });
});

module.exports = router;
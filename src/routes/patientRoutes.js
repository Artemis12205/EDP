const express = require("express");
const router = express.Router();
const { patients } = require("../data/sampleData");

// GET /api/patients - list patients; optional ?search=name
router.get("/", (req, res) => {
  const search = String(req.query.search || "").trim().toLowerCase();
  const results = search
    ? patients.filter((item) => item.fullName.toLowerCase().includes(search))
    : patients;

  res.json({ success: true, count: results.length, data: results });
});

// GET /api/patients/:id - get a patient by ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ success: false, message: "Patient ID must be a number." });
  }

  const patient = patients.find((item) => item.id === id);
  if (!patient) {
    return res.status(404).json({ success: false, message: "Patient not found." });
  }

  res.json({ success: true, data: patient });
});

module.exports = router;
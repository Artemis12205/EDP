const mongoose = require("mongoose");

const healthInformationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, default: "General Health" },
    content: { type: String, required: true, trim: true },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.HealthInformation || mongoose.model("HealthInformation", healthInformationSchema);

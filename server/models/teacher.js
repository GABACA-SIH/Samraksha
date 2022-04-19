const mongoose = require("mongoose");

const Teachers = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    classteacher: { type: String, required: true },
    assignedclasses: { type: Array, required: true },
  },
  { collection: "teacher" }
);

const model = mongoose.model("TeachersData", Teachers);

module.exports = model;

const mongoose = require("mongoose");

const Parents = new mongoose.Schema(
  {
    rollno: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    number: { type: String, required: true },
  },
  { collection: "parent" }
);

const model = mongoose.model("ParentData", Parents);

module.exports = model;

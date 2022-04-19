const mongoose = require("mongoose");

const Students = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollno: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    parentname: { type: String, required: true },
    parentnumber: { type: String, required: true },
    classnumber: { type: String, required: true },
    // attendance: { type: Mixed},
    notices: { type: Array },
    moments: { type: Array },
    complaints: { type: Array },
  },
  { collection: "student" }
);

const model = mongoose.model("StudentData", Students);

module.exports = model;

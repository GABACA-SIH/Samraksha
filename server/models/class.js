const mongoose = require("mongoose");

const Classes = new mongoose.Schema(
  {
    classnumber: { type: String, required: true, unique: true },
    classteacher: { type: String },
    students: { type: Array },
    timetable: { type: Object },
  },
  { collection: "classes" }
);

const model = mongoose.model("ClassData", Classes);

module.exports = model;

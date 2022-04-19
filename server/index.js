const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const { spawn } = require("child_process");

const Users = require("./models/user");
const Students = require("./models/student");
const Parents = require("./models/parent");
const Teachers = require("./models/teacher");
const Classes = require("./models/class");
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/sih");

// CHATBOT
app.post("/api/chatbot", (req, res) => {
  try {
    var dataToSend;
    // console.log(req.body.query);
    const python = spawn("python", ["Main.py", req.body.query]);

    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      // console.log(data);
      dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed

    python.on("close", (code) => {
      console.log(`child process close all stdio with code ${dataToSend}`);
      res.json({ answer: dataToSend.split("\r")[0] });
    });
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
});

// REGISTER STUDENT
app.post("/api/register/student", async (req, res) => {
  console.log(req.body);
  try {
    await Users.create({
      username: req.body.rollno,
      password: req.body.password,
      usertype: "student",
    });
    await Users.create({
      username: req.body.parentnumber,
      password: req.body.parentpassword,
      usertype: "parent",
    });
    await Students.create({
      name: req.body.name,
      rollno: req.body.rollno,
      password: req.body.password,
      email: req.body.email,
      age: req.body.age,
      parentname: req.body.parentname,
      parentnumber: req.body.parentnumber,
      classnumber: req.body.classnumber,
    });
    await Parents.create({
      rollno: req.body.rollno,
      name: req.body.parentname,
      number: req.body.parentnumber,
      password: req.body.parentpassword,
    });
    await Classes.updateOne(
      { classnumber: req.body.classnumber },
      { $push: { students: req.body.rollno } }
    );
    res.json({ status: "ok" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error" });
  }
});

// REGISTER TEACHER
app.post("/api/register/teacher", async (req, res) => {
  console.log(req.body);
  let classno = req.body.classteacher;
  try {
    await Users.create({
      username: req.body.name,
      password: req.body.password,
      usertype: "teacher",
    });
    await Teachers.create({
      name: req.body.name,
      subject: req.body.subject,
      password: req.body.password,
      email: req.body.email,
      age: req.body.age,
      classteacher: req.body.classteacher,
      assignedclasses: req.body.assignedclasses,
    });
    await Classes.updateOne(
      { classnumber: req.body.classteacher },
      { classteacher: req.body.name }
    );
    res.json({ status: "ok" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error" });
  }
});

// MANAGE CLASSES
app.post("/api/manageclasses", async (req, res) => {
  const classes = req.body.classes;
  const method = req.body.method;
  // console.log(classes);
  try {
    if (method === "0") {
      classes.forEach(async (each) => {
        await Classes.create({ classnumber: each });
      });
      res.json({ status: "ok" });
    } else if (method === "1") {
      classes.forEach(async (each) => {
        await Classes.findOneAndRemove({ classnumber: each });
        res.json({ status: "ok" });
      });
      res.json({ status: "ok" });
    } else res.json({ status: "error" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  console.log(req.body);
  console.log(req.body.password);

  const user = await Users.findOne({
    username: req.body.username,
    password: req.body.password,
  }).exec();

  console.log(user);

  if (user) {
    console.log(user);
    if (user.usertype === "student") {
      const stud = await Students.findOne({ rollno: req.body.username }).exec();
      res.json({
        status: "found",
        Auth: "true",
        name: stud.name,
        type: user.usertype,
      });
    } else if (user.usertype === "security" || user.usertype === "admin") {
      res.json({
        status: "found",
        Auth: "true",
        type: user.usertype,
      });
    } else if (user.usertype === "teacher") {
      const teacher = await Teachers.findOne({
        name: req.body.username,
      }).exec();
      res.json({
        status: "found",
        Auth: "true",
        name: teacher.name,
        type: user.usertype,
      });
    } else if (user.usertype === "parent") {
      const parent = await Parents.findOne({
        number: req.body.username,
      }).exec();
      res.json({
        status: "found",
        Auth: "true",
        name: parent.name,
        rollno: parent.rollno,
        type: user.usertype,
      });
    } else res.json({ status: "invalid user" });
    // res.json({status: "found",Auth: "true",name: name,type: user.usertype,});
  } else res.json({ status: "error" });
});

// GET STUDENT DATA
app.post("/api/getstudent", async (req, res) => {
  const student = await Students.findOne({ rollno: req.body.rollno });
  if (student) {
    res.json({
      status: "success",
      name: student.name,
      class: student.classnumber,
      email: student.email,
    });
  } else res.json({ status: "in valid student" });
});

// CHECK IN
app.post("/api/checkin", async (req, res) => {
  const student = await Students.findOne({ rollno: req.body.rollno });
  const arr = student.moments;
  if (arr.length === 0) res.json({ status: "first checkout man" });
  else {
    const last = arr[arr.length - 1];
    console.log(last);
    if (last.checkin === "false") {
      await Students.updateOne(
        { rollno: req.body.rollno },
        { $pull: { moments: last } }
      );
      last.checkin = req.body.time;
      console.log(last);
      await Students.updateOne(
        { rollno: req.body.rollno },
        { $push: { moments: last } }
      );
      res.json({ status: "success" });
    } else res.json({ status: "already checked in" });
  }
});

// CHECK OUT
app.post("/api/checkout", async (req, res) => {
  const student = await Students.findOne({ rollno: req.body.rollno });
  const arr = student.moments;
  console.log(arr);
  if (arr.length == 0) {
    let obj = {
      checkout: req.body.time,
      description: req.body.description,
      checkin: "false",
    };
    console.log(obj);
    await Students.updateOne(
      { rollno: req.body.rollno },
      {
        $push: {
          moments: obj,
        },
      }
    );
    res.json({ status: "success" });
  } else {
    const last = arr[arr.length - 1];
    if (last.checkin !== "false") {
      await Students.updateOne(
        { rollno: req.body.rollno },
        {
          $push: {
            moments: {
              checkout: req.body.time,
              description: req.body.description,
              checkin: "false",
            },
          },
        }
      );
      res.json({ status: "success" });
    } else res.json({ status: "already checked out" });
  }
});

// GET MOMENTS
app.post("/api/getmoments", async (req, res) => {
  let rollno = req.body.rollno;
  let student = await Students.findOne({ rollno: rollno });
  if (student) {
    let data = student.moments;
    res.json({ moments: data.slice(-10) });
  } else res.json({ status: "error" });
});

// GET STUDENT PROFILE DATA
app.post("/api/getstudentprofile", async (req, res) => {
  const student = await Students.findOne({ rollno: req.body.rollno });
  if (student) {
    res.json({
      status: "success",
      name: student.name,
      rollno: student.rollno,
      class: student.classnumber,
      email: student.email,
      age: student.age,
      parentnumber: student.parentnumber,
      classnumber: student.classnumber,
    });
  } else res.json({ status: "in valid student" });
});

// GET PARENT PROFILE DATA
app.post("/api/getparentprofile", async (req, res) => {
  const parent = await Parents.findOne({ rollno: req.body.rollno });
  if (parent) {
    res.json({
      status: "success",
      name: parent.name,
      rollno: parent.rollno,
      number: parent.number,
    });
  } else res.json({ status: "in valid parent" });
});

// GET TEACHER DATA
app.post("/api/getteacherprofile", async (req, res) => {
const teacher = await Teachers.findOne({ name: req.body.name });
if (teacher) {
  res.json({
    status: "success",
    name: teacher.name,
    subject: teacher.subject,
    email: teacher.email,
    age: teacher.age,
    classteacher: teacher.classteacher,
});
} else res.json({ status: "in valid parent" });
});

// ADD TIMETABLE
app.post("/api/addtimetable", async (req, res) => {
  try {
    await Classes.updateOne(
      { classnumber: req.body.classnumber },
      { $set: { timetable: req.body.table } }
    );
    res.json({ status: "ok" });
  } catch (err) {
    res.json({ error: err });
  }
});

// ADD COMPLAINT
app.post("/api/addcomplaint", async (req, res) => {
  try {
    let rollno = req.body.rollno;
    let complaint = {
      date: req.body.date,
      teacher: req.body.Teacher,
      description: req.body.Complaint,
    };
    await Students.updateOne(
      { rollno: rollno },
      { $push: { complaints: complaint } }
    );
    res.json({ status: "ok" });
  } catch (err) {
    res.json({ error: err });
  }
});

// VIEW COMPLAINT
app.post("/api/viewcomplaint", async (req, res) => {
  try {
    const student = await Students.findOne({ rollno: req.body.rollno }).exec();
    // console.log(req.body.rollno +" "+student);
    res.json({ status: "ok", complaints: student.complaints });
  } catch (err) {
    res.json({ error: err });
  }
});

// app.post('/api/login', async (req, res) => {
// 	const user = await User.findOne({
// 		email: req.body.email,
// 	})
// 	if (!user) {
// 		return { status: 'error', error: 'Invalid login' }
// 	}
// 	const isPasswordValid = await bcrypt.compare(
// 		req.body.password,
// 		user.password
// 	)
// 	if (isPasswordValid) {
// 		const token = jwt.sign(
// 			{
// 				name: user.name,
// 				email: user.email,
// 			},
// 			'secret123'
// 		)
// 		return res.json({ status: 'ok', user: token })
// 	} else {
// 		return res.json({ status: 'error', user: false })
// 	}
// })
// app.get('/api/quote', async (req, res) => {
// 	const token = req.headers['x-access-token']
// 	try {
// 		const decoded = jwt.verify(token, 'secret123')
// 		const email = decoded.email
// 		const user = await User.findOne({ email: email })
// 		return res.json({ status: 'ok', quote: user.quote })
// 	} catch (error) {
// 		console.log(error)
// 		res.json({ status: 'error', error: 'invalid token' })
// 	}
// })
// app.post('/api/quote', async (req, res) => {
// 	const token = req.headers['x-access-token']
// 	try {
// 		const decoded = jwt.verify(token, 'secret123')
// 		const email = decoded.email
// 		await User.updateOne(
// 			{ email: email },
// 			{ $set: { quote: req.body.quote } }
// 		)
// 		return res.json({ status: 'ok' })
// 	} catch (error) {
// 		console.log(error)
// 		res.json({ status: 'error', error: 'invalid token' })
// 	}
// })

app.get("/test", async (req, res) => {
  return res.send("hello");
});

app.listen(2000, () => {
  console.log("Server started on 2000");
});

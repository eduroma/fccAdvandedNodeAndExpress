"use strict";

const express = require("express");
const pug = require("pug");
const bodyParser = require("body-parser");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug");

app.route("/").get((req, res) => {
  // res.sendFile(process.cwd() + "/views/index.html");
  res.render(process.cwd() + "/views/pug/index");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});

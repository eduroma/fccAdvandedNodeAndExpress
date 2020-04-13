"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const session = require("express-session");
const mongo = require("mongodb").MongoClient;

const routes = require("./routes.js");
const auth = require("./auth.js");

const app = express();

dotenv.config();

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "pug");

mongo.connect(process.env.DATABASE, (err, cluster) => {
  if (err) {
    console.log("Database error: " + err);
  } else {
    console.log("Successful database connection");

    const db = cluster.db("fccauth");

    routes(app, db);
    auth(app, db);

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }
});

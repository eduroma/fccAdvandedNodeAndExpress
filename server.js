"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const mongo = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;

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

app.route("/").get((req, res) => {
  // res.sendFile(process.cwd() + "/views/index.html");
  res.render(process.cwd() + "/views/pug/index", {
    title: "Hello",
    message: "Please login",
    showLogin: true,
  });
});

app
  .route("/login")
  .post(
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res) => {
      res.render(process.cwd() + "/views/pug/profile");
    }
  );

app.route("/profile").get(ensureAuthenticated, (req, res) => {
  res.render(process.cwd() + "/views/pug/profile");
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/");
}

mongo.connect(process.env.DATABASE, (err, cluster) => {
  if (err) {
    console.log("Database error: " + err);
  } else {
    console.log("Successful database connection");

    const db = cluster.db("fccauth");

    passport.use(
      new LocalStrategy(function (username, password, done) {
        db.collection("users").findOne({ username: username }, function (
          err,
          user
        ) {
          console.log("User " + username + " attempted to log in.");
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          if (password !== user.password) {
            return done(null, false);
          }
          return done(null, user);
        });
      })
    );

    //serialization and app.listen
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
      db.collection("users").findOne(
        {
          _id: new ObjectID(id),
        },
        (err, doc) => {
          done(null, doc);
        }
      );
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }
});

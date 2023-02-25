const express = require("express");
const cors = require("cors");
const { connection } = require("./Config/db");
const { userRouter } = require("./Routes/user.Roter");
const { passport } = require("./Config/google-oauth");
const app = express();
const port = 7575;
const path = require("path");
const filePath = path.join(
  __dirname,
  "..",
  "Frontend",
  "index.html"
);
app.use(cors());
// app.use(express.static(__dirname +   "..",
// "Frontend",
// "signup&login",
// "signup.css"));
app.use("/user", userRouter);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log(req.user);
    res.sendFile(filePath);
  }
);

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.listen(port, async () => {
  try {
    await connection;
    console.log("connected to Database");
  } catch (err) {
    console.log("Not connected to db");
  }
  console.log(`Server is at Port: ${port}`);
});

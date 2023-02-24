const express = require("express")
const { connection } = require("./Config/db");
const { userRouter } = require("./Routes/user.Roter");
const { passport } = require("./Config/google-oauth")
const app = express()
const port = 7575
const cors = require('cors')
const { postman } = require('./Routes/postman.router')
app.use("/user", userRouter)
app.use(express.json())
app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(postman);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  function (req, res) {

    // Successful authentication, redirect home.
    console.log(req.user)
    res.redirect('/');
  });


app.get("/", (req, res) => {
  res.send("Welcome")
})

app.listen(port, async () => {
  try {
    await connection
    console.log("connected to Database")
  } catch (err) {
    console.log("Not connected to db")
  }
  console.log(`Server is at Port: ${port}`)
})
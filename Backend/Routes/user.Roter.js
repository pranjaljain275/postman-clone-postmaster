const express = require("express")
const fs = require("fs")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require("../Model/user.model")
const { passport } = require("../Config/google-oauth")

const userRouter = express.Router()

userRouter.use(express.json())

userRouter.get("/", (req, res) => {
    res.send("user")
})

userRouter.post("/signup",async(req,res)=>{
    const {email,username,password}=req.body
    try{
        const useremail=await UserModel.findOne({email})
        if(useremail){
           return res.send({msg:"User already exits"})
        }
        bcrypt.hash(password, 5, async function(err, hash) {
           if(err){
            res.send("error in signup")
           }else{
            const user=UserModel({email,username,password:hash})
            await user.save()
            console.log(user)
            res.send({msg:"Signed up successful"})
           }
        });
    } catch (err) {
        res.send("Error in signup")
        console.log(err)
    }
})

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await UserModel.findOne({ email })
        if (!user) {
            res.send("Please signup first")
        }
        const hashedpwd = user?.password

        bcrypt.compare(password, hashedpwd, function (err, result) {
            if (result) {
                const token = jwt.sign({ userID: user._id }, 'NORMAL_SECRET', { expiresIn: 120 });
                const refresh_token = jwt.sign({ userID: user._id }, 'REFRESH_SECRET', { expiresIn: 240 });
                res.send({ msg: "Login Successfull", token, refresh_token })
            } else {
                res.send("Login failed")
            }
        })
    } catch (err) {
        res.send("Error in login")
        console.log(err)
    }
})

userRouter.get("/logout", (req, res) => {
    const token = req.headers.authorization
    const blacklisted = JSON.parse(fs.readFileSync("../blacklist.json", "utf-8"))
    blacklisted.push(token)
    fs.writeFileSync("../blacklist.json", JSON.stringify(blacklisted))
    res.send("logged out successfully")
})



module.exports = {
    userRouter
}
const express=require("express")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {UserModel}=require("../Model/user.model")
const {authenticate}=require("./Middleware/authentication.middleware")

const userRouter=express.Router()

userRouter.use(express.json())

userRouter.post("/signup",async(req,res)=>{
    const {email,username,password}=req.body
    try{
        bcrypt.hash(password, 5, async function(err, hash) {
           if(err){
            res.send("error in signup")
           }else{
            const user=UserModel({email,username,password:hash})
            await user.save()
            res.send("Signed up successful")
           }
        });
    }catch(err){
        
        res.send("Error in signup")
        console.log(err)
    }
})

userRouter.post("/login",async(req,res)=>{
    const {email,password}=req.body
    try{
    const user=await UserModel.findOne({email})
    if(!user){
        res.send("Please signup first")
    }
    const hashedpwd=user?.password
    
    bcrypt.compare(password,hashedpwd,function(err,result){
        if(result){
            const token = jwt.sign({userID:user._id }, 'NORMAL_SECRET',{expiresIn:120});
            const refresh_token = jwt.sign({userID:user._id }, 'REFRESH_SECRET',{expiresIn:240});
            res.send({msg:"Login Successfull",token,refresh_token})
        }else{
            res.send("Login failed")
        }
    })
    }catch(err){
        res.send("Error in login")
        console.log(err)
    }
})

module.exports={
    userRouter
}
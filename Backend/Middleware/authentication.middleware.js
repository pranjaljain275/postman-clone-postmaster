const jwt=require("jsonwebtoken")

const fs=require("fs")

const authenticate=(req,res,next)=>{
    const token=req.headers.authorization

    if(!token){
        res.send("Login again")

    }
    
    jwt.verify(token,'NORMAL_SECRET',function(err,decoded){
        if(err){
            res.send({"msg":"please login first","err":err.message})
        }else{
            next()
        }
    })
}

module.exports={
    authenticate
}
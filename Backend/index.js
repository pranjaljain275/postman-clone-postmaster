const express=require("express")
const {connection}=require("./Config/db");
const {userRouter}=require("./Routes/user.Roter")

const app=express()
const port=7575

app.use("user",userRouter)

app.get("/",(req,res)=>{
    res.send("Welcome")
})

app.listen(port,async()=>{
    try{
        await connection
        console.log("connected to Database")
    }catch(err){
        console.log("Not connected to db")
    }
    console.log(`Server is at Port: ${port}`)
})
const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: String,
    username: String,
    password: String
},
    {
        versionKey: false
    })

const testSchema = mongoose.Schema({
    userid: Number,
    name: String,
    title: String
},
    {
        versionKey: false
    })
const UserModel = mongoose.model("user", userSchema)
const testModel = mongoose.model("test", testSchema)

module.exports = {
    UserModel, testModel
}
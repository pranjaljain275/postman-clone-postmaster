const mongoose = require("mongoose")
mongoose.set('strictQuery', false)
const connection = mongoose.connect('mongodb+srv://Vishalsingh007:vishalsingh@cluster0.8bjxabo.mongodb.net/testAuth?retryWrites=true&w=majority')

module.exports = {
    connection
}
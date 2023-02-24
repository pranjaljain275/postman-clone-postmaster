const express = require("express");
const postman = express.Router();
const { testModel } = require("../Model/user.model");

// GET request to retrieve all data
postman.get("/title", async (req, res) => {
    try {
        let data = await testModel.find();
        res.send(data);
    } catch (error) {
        // Catch any errors and throw them
        throw error;
    }
});

// POST request to create new data
postman.post("/title", async (req, res) => {
    try {
        let data = new testModel(req.body);
        await data.save();
        res.send(data);
        console.log(data);
    } catch (error) {
        // Catch any errors and throw them
        throw error;
    }
});

// PUT request to update existing data by replacing it entirely
postman.put("/title/:Id", async (req, res) => {
    const { Id } = req.params;
    const update = req.body;
    try {
        // Find the existing data by ID and replace it with the new data
        await testModel.findByIdAndUpdate({ "_id": Id }, update);
        // Get all data again after the update and send it back as the response
        const alldata = await testModel.find();
        res.send(alldata);
    } catch (error) {
        // Catch any errors and log them
        console.log("something went wrong");
        console.log({ error: error });
    }
});

// PATCH request to update existing data partially
postman.patch("/title/:Id", async (req, res) => {
    const { Id } = req.params;
    const update = req.body;
    try {
        // Find the existing data by ID and update it with the new data
        await testModel.findByIdAndUpdate({ "_id": Id }, update);
        // Get all data again after the update and send it back as the response
        const alldata = await testModel.find();
        res.send(alldata);
    } catch (error) {
        // Catch any errors and log them
        console.log("something went wrong");
        console.log({ error: error });
    }
});

// DELETE request to delete existing data
postman.delete("/title/:Id", async (req, res) => {
    const { Id } = req.params;
    try {
        // Find the data by ID and delete it
        await testModel.findByIdAndDelete(Id);
        // Get all data again after the delete and send it back as the response
        const alldata = await testModel.find();
        res.send(alldata);
    } catch (error) {
        // Catch any errors and log them
        console.log("something went wrong");
        console.log({ error: error });
    }
});

module.exports = { postman };

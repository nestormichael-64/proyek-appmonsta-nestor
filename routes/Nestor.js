const express = require('express');
const router = express.Router();
const request = require('request');
const models = require("../models");

require('dotenv').config();
const access_key = process.env.ACCESS_KEY;

router.get('/getRating/', async function(req,res){
    const appID = req.query.appID;
    if(!appID) res.status(400).send("ID App harus dicantumkan!");
    
});

module.exports = router;
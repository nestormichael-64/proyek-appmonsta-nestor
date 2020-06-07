const express = require('express');
const router = express.Router();
const request = require('request');
const models = require("../models");
const jwt = require("jsonwebtoken");

require('dotenv').config();
const access_key = process.env.ACCESS_KEY;

// get all app id # tidak terpakai
router.get('/getAllID', async function(req, res) {
  const allID = await new Promise(function(resolve, reject) {
    var options = {
      'method' : 'GET',
      'url' : `https://api.appmonsta.com/v1/stores/android/ids`,
      'headers' : {
        'Authorization': `Basic ${access_key}`
      }
    }
    request(options, function(error, response) {
      if (error) reject(new Error(error));
      else resolve((response.body).split("\n"));
    });
  });
  res.json(allID);
});

router.get('/getAllAppDetail', async function(req, res) {
  const date = new Date().toISOString().split('T')[0];
  const allAppDetail = await new Promise(function(resolve, reject) {
    var options = {
      'method' : 'GET',
      'url' : `https://api.appmonsta.com/v1/stores/android/details.json?date=${date}&country=US`,
      'headers' : {
        'Authorization': `Basic ${access_key}`
      }
    }
    request(options, function(error, response) {
      if (error) reject(new Error(error));
      else resolve(JSON.parse(response.body)); // kacau disini, tidak bisa json parse
    });
  });
  res.json(allAppDetail);
});

// get app detail
router.get('/app', async function(req, res) {
  const ID = req.query.app_id;
  const data = await new Promise(function(resolve, reject) {
    var options = {
      'method' : 'GET',
      'url' : `https://api.appmonsta.com/v1/stores/android/details/${ID}.json?country=US`,
      'headers' : {
        'Authorization': `Basic ${access_key}`
      }
    }
    request(options, function(error, response) {
      if (error) reject(new Error(error));
      else resolve(JSON.parse(response.body));
    });
  });

  //catat history untuk recommendation
  const token = req.header("x-auth-token");
  if (token){
    let user = {}
    try { 
      user = jwt.verify(token, "lastofkelasB"); 
      const email = user.email;
      for (let i = 0; i < data.genres.length; i++) {
        const genre = data.genres[i];
        const historyCheck = await models.getHistory(email, genre);
        if (historyCheck.length == 0) await models.insertHistory(email, genre);
        else await models.updateHistory(email, genre, historyCheck[0].jumlah_akses + 1);
      }
    } catch (err) { console.log("Token Invalid"); console.log(err); } 
  }
  res.json(data);
});

// Wishlist
router.get('/wishlist', async function(req, res) {
  const token = req.header("x-auth-token");
  const user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); } 
  catch (err) { return res.status(401).send("Token Invalid"); } //401 not authorized
  const email = user.email;
  const app_id = req.query.app_id;
  const userCheck = await models.getUser(email);
  if (userCheck.length == 0) return res.status(400).send({message:"User belum terdaftar"});
  const result = await models.getWishlist(email, app_id);
  if (result) res.status(200).send({value: result});
  else if (!result) res.status(400).send({message: "aplikasi wishlist tidak ditemukan"});
});
router.post('/wishlist', async function(req, res) {
  const token = req.header("x-auth-token");
  const user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); } 
  catch (err) { return res.status(401).send("Token Invalid"); } //401 not authorized
  const email = user.email;
  const app_id = req.body.app_id;
  let userCheck = await models.getUser(email);
  if (userCheck.length == 0) return res.status(400).send({message:"User belum terdaftar"});
  const appCheck = await new Promise(function(resolve, reject) {
    var options = {
      'method' : 'GET',
      'url' : `https://api.appmonsta.com/v1/stores/android/details/${app_id}.json?country=US`,
      'headers' : {
        'Authorization': `Basic ${access_key}`
      }
    }
    request(options, function(error, response) {
      if (error) reject(new Error(error));
      else resolve(JSON.parse(response.body));
    });
  });
  if (appCheck.message) return res.status(400).send({message:"Aplikasi tidak ditemukan"});
  const result = await models.insertWishlist(email, app_id);
  if (result) res.status(200).send({message:"app berhasil ditambahkan ke wishlist"});
});
router.delete('/wishlist', async function(req, res) {
  const token = req.header("x-auth-token");
  const user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); } 
  catch (err) { return res.status(401).send("Token Invalid"); } //401 not authorized
  const email = user.email;
  const app_id = req.body.app_id;
  let userCheck = await models.getUser(email);
  if (userCheck.length == 0) return res.status(400).send({message:"User belum terdaftar"});
  const appCheck = await models.getWishlist(email, app_id);
  if (appCheck.length == 0) return res.status(400).send({message:"Aplikasi tidak ditemukan"});
  const result = await models.deleteWishlist(email, app_id);
  if (result) res.status(200).send({message:"app berhasil dibuang dari wishlist"});
});

router.get('/recommendation', async function(req, res) {
  const token = req.header("x-auth-token");
  var user = {};
  if (!token) return res.status(401).send("Token not found");
  try { user = jwt.verify(token, "lastofkelasB"); } 
  catch (err) { console.log(err); return res.status(401).send("Token Invalid"); } //401 not authorized
  const email = user.email;
  const histories = await models.getHistory(email, null);

  // Mulai kacau disini
  /* 
    harusnya kalo bisa get all app detail
    nda perlu ambil appnya satu satu
    lihat remark di line 40
  */ 
  var apps = [];
  if (histories) {
    const allID = await new Promise(function(resolve, reject) {
      var options = {
        'method' : 'GET',
        'url' : `https://api.appmonsta.com/v1/stores/android/ids`,
        'headers' : {
          'Authorization': `Basic ${access_key}`
        }
      }
      request(options, function(error, response) {
        if (error) reject(new Error(error));
        else resolve((response.body).split("\n"));
      });
    });
    for (let i = 0; i < allID.length; i++) {
      const id = allID[i];
      const data = await new Promise(function(resolve, reject) {
        var options = {
          'method' : 'GET',
          'url' : `https://api.appmonsta.com/v1/stores/android/details/${id}.json?country=US`,
          'headers' : {
            'Authorization': `Basic ${access_key}`
          }
        }
        request(options, function(error, response) {
          if (error) reject(new Error(error));
          else resolve(JSON.parse(response.body));
        });
      });
      apps.push(data);
      console.log(data);
    }
    var reccomendation = [];
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      for (let j = 0; j < histories.length; j++) {
        if (j == 3) break;
        const history = histories[j];
        if (app.genre == history.genre) {
          reccomendation.push(app);
        }
      }
    }
    res.status(200).send({value: reccomendation});

    //sampai sini
  } else return res.status(400).send({message:"Recommendation tidak dapat digenerate \nBuka beberapa aplikasi untuk menjalankan fungsi ini"});
});

module.exports = router;
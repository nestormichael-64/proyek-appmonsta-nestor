require('dotenv').config()
const express = require("express");
const router = express.Router();
const request = require('request');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const models = require("../models");
const jwt = require("jsonwebtoken");
const stripe = require('stripe')(process.env.STRIPED_SECRET_KEY);
const midtransClient = require('midtrans-client');
const access_key = process.env.ACCESS_KEY;

//SET STORAGE ENGINE
const storage=multer.diskStorage({
    destination:'./public/uploads',
    filename:function(req,file,cb){
        cb(null,req.body.email + path.extname(file.originalname));
    }
});

const upload=multer({
    storage:storage,
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('profile_picture');

function checkFileType(file,cb){
    const filetypes= /jpeg|jpg|png|gif/;
    const extname=filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype=filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    }else{
        cb('Error: Image Only!');
    }
}

async function upgrade_user(email){
    let result = await models.upgrade_user(email)
    return result
}

async function insert_to_vote(id_app, id_list_vote, indeks_pilihan_vote){
    const data = await new Promise(function(resolve, reject) {
        var options = {
            'method' : 'GET',
            'url' : `https://api.appmonsta.com/v1/stores/android/details/${id_app}.json?country=US`,
            'headers' : {
            'Authorization': `Basic ${access_key}`
            }
        }
        request(options,function(error, response) {
            if (error) reject(new Error(error));
            else resolve(JSON.parse(response.body));
        });
        });
    await models.insert_vote(data, id_list_vote, indeks_pilihan_vote)
    return true;
}

router.post('/register',async function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    
    if(username == ""|| password == "" || email == "") res.status(400).send("ada field yang tidak diisi");
    let result = await models.register_user(username, password, email);
    if(!result) res.status(400).send("register gagal email pernah digunakan")
    else res.status(400).send("register berhasil")
});

router.post("/login" ,async function(req,res){
    var email = req.body.email;
    var password = req.body.password;

    let result = await models.login_user(email, password);
    if(!result) res.status(400).send("Login gagal user tidak ditemukan")
    else{
        const token = jwt.sign({    
            "email":result.email,
            "level":result.tipe_user
        }   ,"lastofkelasB", {expiresIn : '1h'});
        res.status(200).send(token);
    }
});

router.put("/update_profile" , upload,  async function(req,res){
    var username  = req.body.username;
    var password = req.body.password;
    var profile_picture = req.file;
    const token = req.header("x-auth-token");
    var user = 1;
    if(!token) res.status(400).send("Anda harus melakukan login terlebih dahulu.")
    else{
        try{
            user = jwt.verify(token,"lastofkelasB");
        }catch(err){
            return res.status(401).send("Token Invalid harap lakukan login ulang");
        }
        let result = await models.update_profile(username, password, user.email + path.extname(req.file.originalname).toLowerCase(), user.email)
        if(result)res.status(200).send("Profile berhasil di update")
        else res.status(404).send("user dengan email tersebut tidak ditemukan")
    }
});

router.put("/upgrade_premium", async function(req,res){
    var credit_card_number = req.body.credit_card_number;
    var expired_month = req.body.expired_month;
    var expired_year = req.body.expired_year;
    var cvc = req.body.cvc;
    const token = req.header("x-auth-token");
    var user = 1;
    if(!token) res.status(400).send("Anda harus melakukan login terlebih dahulu.")
    else{
        try{
            user = jwt.verify(token,"lastofkelasB");
        }catch(err){
            return res.status(401).send("Token Invalid harap lakukan login ulang");
        }
        if(user.level == 1){
            stripe.tokens.create(
                {
                  card: {
                    number: credit_card_number,
                    exp_month: expired_month,
                    exp_year: expired_year,
                    cvc: cvc,
                  },
                },
                async function(err, token) {
                    if(err)res.status(400).send(err)
                    else{
                        console.log(token)
                        var biaya = 10000000;
                        var charge = stripe.charges.create({
                            amount : biaya,
                            currency : "idr",
                            source : token.id
                        }, async function(err,charge){
                            if(err && err.type ==="stripeCardError"){
                                res.status(400).send("Kartu anda telah ditolak")
                            }
                            else{
                                let result = upgrade_user(user.email);
                                if(result) res.status(200).send("Pembayaran telah berhasil dilakukan, anda telah menjadi premium member")
                                else res.status(404).send("user dengan email tersebut tidak ditemukan")
                            }
                        })
                    }
                }
              );
        }
        else{
            return res.send(400).send("anda sudah terdaftar sebagai premium member")
        }
    }
});


router.post('/make_vote' , async function(req,res){
    var list_id_app = req.query.id_app.split(',')
    var judul_vote = req.body.judul_vote

    const token = req.header('x-auth-token')
    var user = 1;
    if(!token)res.status(400).send("anda harus melakukan login terlebih dahulu")
    else{
        try{
            user = jwt.verify(token,"lastofkelasB");
        }catch(err){
            return res.status(401).send("Token Invalid harap lakukan login ulang");
        }
        let result = await models.make_vote(judul_vote, user.email);
        for(var indeks_list_id_app = 0;indeks_list_id_app<list_id_app.length;indeks_list_id_app++){
            insert_to_vote(list_id_app[indeks_list_id_app], result.insertId, indeks_list_id_app + 1)
        }
        res.status(200).send('Vote berhasil dibuat');
    }
})

router.get('/input_vote' , async function(req,res){
    var id_list_vote = req.body.id_list_vote
    var indeks_pilihan_vote = req.body.indeks_pilihan_vote

    const token = req.header('x-auth-token')
    var user = 1;
    if(!token)res.status(400).send("anda harus melakukan login terlebih dahulu")
    else{
        try{
            user = jwt.verify(token,"lastofkelasB");
        }catch(err){
            return res.status(401).send("Token Invalid harap lakukan login ulang");
        }
        let result = await models.input_vote(user.email, id_list_vote, indeks_pilihan_vote);
        if(result){
            res.status(200).send("Vote anda telah disimpan")
        }
        else{
            res.status(400).send("Anda sudah pernah melakukan vote pada voting ini")
        }
    }
});

router.get('/get_ranking_vote', async function(req,res){
    var id_list_vote = req.body.id_list_vote

    let result = await models.get_ranking_vote(id_list_vote);
    if(!result){
        res.status(400).send("vote yang anda cari tidak ditemukan")
    }
    else{
        res.status(200).send(result)
    }
});

router.get('/test', function(req,res){
    res.status(200).send("waow")
});

module.exports = router;
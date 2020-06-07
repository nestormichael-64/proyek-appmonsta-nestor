const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const models = require("../models");
const jwt = require("jsonwebtoken");

//VAR POST
var post = [];

//SET STORAGE ENGINE
const storage=multer.diskStorage({
    destination:'./public/uploads/post',
    filename:function(req,file,cb){
        cb(null,post[post.length-1].id_post+".jpg");
    }
});

const upload=multer({
    storage:storage,
    fileFilter: function(req,file,cb){
        checkFileType(file,cb);
    }
}).single('img_post');

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

//add post
router.post('/add',async function(req,res){
    let token = req.header('x-auth-token');
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        status = "Gagal Post";
        msg = "Token not found!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        status = "Gagal Post";
        msg = "Invalid token!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }

    if(user_logon.level == 2){
        let app_id = req.body.app_id;
        let judul = req.body.judul;
        let caption = req.body.caption;
        if(app_id == "" || judul == "" || caption == ""){
            status = "Gagal Post";
            msg = "Pastikan semua field terisi!";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(400).send(output);
        }else{
            let insertPost = await models.insertPost(user_logon.email, judul, caption, app_id);
            post = await models.getPost();
            
            upload(req,res,async (err)=>{
                if(err){
                    console.log(err);
                    status = "Gagal Post";
                    let deleteLast = await models.deleteLastPost();
                    output.push({
                        "status" : status,
                        "error" : err,
                        "data" : data
                    });
                    res.status(400).send(output);
                }else{
                    let updateLast = await models.updateLast(user_logon.email, req.body.judul, req.body.caption, req.body.app_id);
                    status = "Berhasil Post";
                    data = await models.getLastPost();
                    output.push({
                        "status" : status,
                        "error" : "",
                        "data" : data
                    });
                    res.status(200).send(output);
                }
            });
        }
    }else{
        status = "Gagal Post";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});

//view post
router.get('/view',async function(req,res){
    let search = req.params.search;
    let id_app = req.params.id_app;
    let date = req.params.date;

    let result = await models.getPost();
    return res.status(200).send(result);
});

//delete post
router.delete('/delete',async function(req,res){
    let token = req.header('x-auth-token');
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        status = "Gagal Delete";
        msg = "Token not found!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        status = "Gagal Delete";
        msg = "Invalid token!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(400).send(output);
    }

    if(user_logon.level == 2){
        let id_post = req.body.id_post;
        if(id_post == ""){
            status = "Gagal Delete";
            msg = "Pastikan semua field terisi!";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(400).send(output);
        }else{
            selected_post = await models.getPostByID(id_post);
            if(selected_post.length > 0){
                if(user_logon.email == selected_post[0].email){
                    let deletePost = await models.deletePostByID(id_post);
    
                    status = "Berhasil Delete";
                    msg = "";
                    output.push({
                        "status" : status,
                        "error" : msg,
                        "data" : data
                    });
                    res.status(200).send(output);
                }else{
                    status = "Gagal Delete";
                    msg = "User tidak memiliki hak akses pada post!";
                    output.push({
                        "status" : status,
                        "error" : msg,
                        "data" : data
                    });
                    res.status(400).send(output);
                }
            }else{
                status = "Gagal Delete";
                msg = "ID Post tidak ditemukan!";
                output.push({
                    "status" : status,
                    "error" : msg,
                    "data" : data
                });
                res.status(401).send(output);
            }
            
        }
    }else{
        status = "Gagal Delete";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});

//edit post
router.put('/edit',async function(req,res){
    let token = req.header('x-auth-token');
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        status = "Gagal Update";
        msg = "Token not found!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        status = "Gagal Update";
        msg = "Invalid token!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }

    if(user_logon.level == 2){
        let judul = req.body.judul;
        let caption = req.body.caption;
        let id_post = req.body.id_post;
        if(judul == undefined || caption == undefined || id_post == undefined){
            status = "Gagal Update";
            msg = "Pastikan semua field terisi!";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(400).send(output);
        }else{
            selected_post = await models.getPostByID(id_post);
            if(selected_post.length > 0){
                if(user_logon.email == selected_post[0].email){
                    let updatePost = await models.updatePost(id_post, judul, caption);
                    data = await models.getPostByID(id_post);
                    status = "Berhasil Update";
                    msg = "";
                    output.push({
                        "status" : status,
                        "error" : msg,
                        "data" : data
                    });
                    res.status(200).send(output);
                }else{
                    status = "Gagal Update";
                    msg = "User tidak memiliki hak akses pada post!";
                    output.push({
                        "status" : status,
                        "error" : msg,
                        "data" : data
                    });
                    res.status(400).send(output);
                }
            }else{
                status = "Gagal Update";
                msg = "ID Post tidak ditemukan!";
                output.push({
                    "status" : status,
                    "error" : msg,
                    "data" : data
                });
                res.status(401).send(output);
            }
        }
    }else{
        status = "Gagal Update";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});

//comment post
router.post('/comment',async function(req,res){
    let token = req.header('x-auth-token');
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        status = "Gagal Comment";
        msg = "Token not found!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        status = "Gagal Comment";
        msg = "Invalid token!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }

    if(user_logon.level == 2){
        let id_post = req.body.id_post;
        let comment = req.body.comment;
        if(comment == undefined || id_post == undefined){
            status = "Gagal Comment";
            msg = "Pastikan semua field terisi!";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(400).send(output);
        }else{
            selected_post = await models.getPostByID(id_post);
            if(selected_post.length > 0){
                let insertReview = await models.reviewPost(id_post, comment);
                data = await models.getLastReview();
                status = "Berhasil Comment";
                msg = "";
                output.push({
                    "status" : status,
                    "error" : msg,
                    "data" : data
                });
                res.status(401).send(output);
            }else{
                status = "Gagal Comment";
                msg = "ID Post tidak ditemukan!";
                output.push({
                    "status" : status,
                    "error" : msg,
                    "data" : data
                });
                res.status(401).send(output);
            }
        }
    }else{
        status = "Gagal Comment";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});

//mypost
router.get('/mypost',async function(req,res){
    let token = req.header('x-auth-token');
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        status = "Gagal MyPost";
        msg = "Token not found!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        status = "Gagal MyPost";
        msg = "Invalid token!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }

    if(user_logon.level == 2){
        my_post = await models.getPostByEmail(user_logon.email)
        if(my_post.length > 0){
            data = my_post;
            status = "Berhasil MyPost";
            msg = "";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(200).send(output);
        }else{
            status = "Gagal MyPost";
            msg = "User tidak memiliki post";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(401).send(output);
        }
    }else{
        status = "Gagal MyPost";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});

//get review post
router.get('/get_review',async function(req,res){
    let token = req.header('x-auth-token');
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        status = "Gagal MyPost";
        msg = "Token not found!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        status = "Gagal MyPost";
        msg = "Invalid token!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }

    if(user_logon.level == 2){
        let id_post = req.body.id_post;
        let selected_post = await models.getPostByID(id_post);
        if(selected_post.length > 0){
            let all_review = await models.getReviewByID(id_post);
            if(all_review.length > 0){
                data = all_review;
                status = "Berhasil Get Review";
                msg = "";
                output.push({
                    "status" : status,
                    "error" : msg,
                    "data" : data
                });
                res.status(200).send(output);
            }else{
                status = "Gagal Get Review";
                msg = "Post tidak memiliki review";
                output.push({
                    "status" : status,
                    "error" : msg,
                    "data" : data
                });
                res.status(400).send(output);
            }
        }else{
            status = "Gagal Get Review";
            msg = "Id Post tidak ditemukan";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(400).send(output);
        }
    }else{
        status = "Gagal Get Review";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});

//like post
router.post('/like',async function(req,res){
    let token = req.header('x-auth-token');
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        status = "Gagal Like";
        msg = "Token not found!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        status = "Gagal Like";
        msg = "Invalid token!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }

    if(user_logon.level == 2){
        let id_post = req.body.id_post;
        let email = user_logon.email;
        if(id_post == undefined){
            status = "Gagal Like";
            msg = "Pastikan semua field terisi!";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(400).send(output);
        }else{
            selected_post = await models.getPostByID(id_post);
            if(selected_post.length > 0){
                already_like = await models.getLikedPost(id_post,email);
                if(already_like.length > 0){
                    status = "Gagal Like";
                    msg = "User sudah melakukan like pada post!";
                    output.push({
                        "status" : status,
                        "error" : msg,
                        "data" : data
                    });
                    res.status(400).send(output);
                }else{
                    already_dislike = await models.getDislikedPost(id_post,email);
                    if(already_dislike.length > 0){
                        runDeleteDislike = await models.deleteDislikedPost(id_post,email);
                    }

                    runInsertLike = await models.insertLikedPost(id_post,email);
                    status = "Berhasil like post";
                    msg = "";
                    output.push({
                        "status" : status,
                        "error" : msg,
                        "data" : data
                    });
                    res.status(200).send(output);
                }
            }else{
                status = "Gagal Like";
                msg = "ID Post tidak ditemukan!";
                output.push({
                    "status" : status,
                    "error" : msg,
                    "data" : data
                });
                res.status(401).send(output);
            }
        }
    }else{
        status = "Gagal Like";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});

//dislike post
router.post('/dislike',async function(req,res){
    let token = req.header('x-auth-token');
    let msg = "";
    let status = "";
    let data = [];
    let output = [];
    let user_logon = {};
    if(!token){
        status = "Gagal Dislike";
        msg = "Token not found!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }
    try{
        user_logon = jwt.verify(token,"lastofkelasB");
    }catch(err){
        //401 not authorized
        status = "Gagal Dislike";
        msg = "Invalid token!";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : ""
        });
        res.status(401).send(output);
    }

    if(user_logon.level == 2){
        let id_post = req.body.id_post;
        let email = user_logon.email;
        if(id_post == undefined){
            status = "Gagal Dislike";
            msg = "Pastikan semua field terisi!";
            output.push({
                "status" : status,
                "error" : msg,
                "data" : data
            });
            res.status(400).send(output);
        }else{
            selected_post = await models.getPostByID(id_post);
            if(selected_post.length > 0){
                already_dislike = await models.getDislikedPost(id_post,email);
                if(already_dislike.length > 0){
                    status = "Gagal Like";
                    msg = "User sudah melakukan dislike pada post!";
                    output.push({
                        "status" : status,
                        "error" : msg,
                        "data" : data
                    });
                    res.status(400).send(output);
                }else{
                    already_like = await models.getLikedPost(id_post,email);
                    console.log(already_like);
                    if(already_like.length > 0){
                        runDeleteLike = await models.deleteLikedPost(id_post,email);
                    }

                    runInsertDislike = await models.insertDislikePost(id_post,email);
                    status = "Berhasil dislike post";
                    msg = "";
                    output.push({
                        "status" : status,
                        "error" : msg,
                        "data" : data
                    });
                    res.status(200).send(output);
                }
            }else{
                status = "Gagal Dislike";
                msg = "ID Post tidak ditemukan!";
                output.push({
                    "status" : status,
                    "error" : msg,
                    "data" : data
                });
                res.status(401).send(output);
            }
        }
    }else{
        status = "Gagal Dislike";
        msg = "Jenis user tidak memiliki hak akses";
        output.push({
            "status" : status,
            "error" : msg,
            "data" : data
        });
        res.status(400).send(output);
    }
});


module.exports = router;
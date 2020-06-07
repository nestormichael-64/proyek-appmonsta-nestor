const mysql = require("mysql");
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, //root
  password: process.env.DB_PASS, //~}+~6h$wmjpxOUc=
  port: process.env.DB_PORT,
  database: process.env.DB_NAME //lob_proyek_soa
});

function getConnection() {
  return new Promise(function(resolve, reject) {
    pool.getConnection(function (err, conn) {
      if (err) reject(err) 
      else resolve(conn)
    });
  });
}

function executeQuery(conn, query) {
  return new Promise(function (resolve, reject) {
    conn.query(query, function (err, result) {
      if (err) reject(err)
      else resolve(result)
    });
  });
}

//query untuk Register
async function register_user(username, password, email){
    const conn = await getConnection();
    let query = `select * from user where email = '${email}'`
    let result = await executeQuery(conn, query)
    if(result.length>0){
      conn.release();
      return false;
    }
    else{
      let query  = `insert into user values('${username}','${password}','${email}',1,'default.jpg',5)`;
      const result = await executeQuery(conn, query);
      conn.release();
      return result;
    }
}

//query untuk login
async function login_user(email, password){
    const conn = await getConnection();
    let query  = `select * from user where email = '${email}' and password = '${password}'`;
    var result = await executeQuery(conn, query);
    if(result.length>0){
        var user = result[0]
        conn.release()
        return user;
    }
    else{
        conn.release();
        return false;
    }
}

//query untuk update profile user
async function update_profile(username, password, profile_picture, email){
  const conn = await getConnection();
  var query =  `select * from user where email = '${email}'`;
  var result = await executeQuery(conn,query);
  if(result.length == 0){
    conn.release();
    return false;
  }
  else{
    var user = result[0]
    query = `update user set username = '${username}', password = '${password}', profile_picture = '${profile_picture}' where email = '${email}'`
    result = await executeQuery(conn,query);
    conn.release();
    return user;
  }
}

async function upgrade_user(email){
  const conn = await getConnection();
  var query =  `select * from user where email = '${email}'`;
  var result = await executeQuery(conn,query);
  if(result.length == 0){
    conn.release();
    return false;
  }
  else{
    var user = result[0]
    query = `update user set tipe_user = 2 where email = '${email}'`
    result = await executeQuery(conn,query);
    conn.release();
    return true;
  }
}

//query untuk membuat voting 
async function make_vote(judul_vote, email_pembuat){
  const conn = await getConnection();
  let query = `insert into list_vote values('','${judul_vote}','${email_pembuat}')`
  let result = await executeQuery(conn, query)
  conn.release();
  return result;
}

async function insert_vote(data, id_list_vote, indeks_pilihan_vote){
  const conn = await getConnection();
  var nama_app = data.app_name;
  var id_app = data.bundle_id;
  var publisher_name = data.publisher_name;
  var app_type = data.app_type;
  var genre = data.genre;

  let query = `insert into vote values('${id_list_vote}','${indeks_pilihan_vote}','${id_app}','${nama_app}','${publisher_name}','${app_type}','${genre}',0)`
  let result = await executeQuery(conn, query)

  conn.release();
  return result;
}

//query ketika user melakukan vote
async function input_vote(email_voter, id_list_vote, indeks_pilihan_vote){
  const conn = await getConnection();
  let query = `select * from history_vote where email_voter = '${email_voter}' AND id_list_vote = '${id_list_vote}'`
  let result = await executeQuery(conn, query)

  if(result.length >= 1){
    conn.release();
    return false;
  }

  query = `insert into history_vote values('${email_voter}','${id_list_vote}','${indeks_pilihan_vote}')`
  await executeQuery(conn, query)

  
  query = `select * from vote where id_list_vote = ${id_list_vote} and indeks_pilihan_vote = ${indeks_pilihan_vote}`
  vote = await executeQuery(conn, query)

  query = `update vote set jumlah_vote = ${vote[0].Jumlah_vote + 1} where id_list_vote = '${id_list_vote}' and indeks_pilihan_vote = '${indeks_pilihan_vote}'`
  await executeQuery(conn, query)
  conn.release();
  return true;
}

//get ranking
async function get_ranking_vote(id_list_vote){
  const conn = await getConnection();
  let query = `select * from vote where id_list_vote = '${id_list_vote}' order by Jumlah_vote DESC`
  let result = await executeQuery(conn, query)

  if(result.length == 0){
    conn.release();s
    return false
  }
  conn.release();
  console.log(result)
  return result;
}

//Mitchell
//mungkin tidak dipakai
async function getUser(email){
  const conn = await getConnection();
  let query = `SELECT * FROM user WHERE email ='${email}'`;
  const result = await executeQuery(conn, query);
  conn.release();
  return result;
}

async function getWishlist(email, app_id){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM wishlist WHERE email ='${email}' AND app_id = '${app_id}'`);
  conn.release();
  return result;
}

async function insertWishlist(email, app_id){
  const conn = await getConnection();
  const result = await executeQuery(conn, `INSERT INTO wishlist VALUES ('${email}','${app_id}')`);
  conn.release();
  return result;
}

async function deleteWishlist(email, app_id){
  const conn = await getConnection();
  const result = await executeQuery(conn, `DELETE FROM wishlist WHERE email ='${email}' AND app_id = '${app_id}'`);
  conn.release();
  return result;
}

async function getHistory(email, genre){
  const conn = await getConnection();
  let query = `SELECT * FROM history WHERE email = '${email}'`;
  if (genre) query += ` AND genre = '${genre}'`;
  query += ` ORDER BY jumlah_akses DESC`;
  const result = await executeQuery(conn, query);
  conn.release();
  return result;
}

async function insertHistory(email, genre){
  const conn = await getConnection();
  const result = await executeQuery(conn, `INSERT INTO history VALUES ('${email}','${genre}',1)`);
  conn.release();
  return result;
}

async function updateHistory(email, genre, akses){
  const conn = await getConnection();
  const result = await executeQuery(conn, `UPDATE history SET jumlah_akses = ${akses} WHERE email = '${email}' AND genre = '${genre}'`);
  conn.release();
  return result;
}

//MING - Add post
async function insertPost(email, judul_post, caption_post, app_id){
  const conn = await getConnection();
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  const result = await executeQuery(conn, `INSERT INTO post VALUES ('','${email}',0,0,'${dateTime}','${judul_post}','${caption_post}','none','${app_id}')`);
  conn.release();
  return result;
}

async function updateLast(email, judul_post, caption_post, app_id){
  const conn = await getConnection();
  const tgl_now = new Date();
  const lastPost = await executeQuery(conn, `SELECT MAX(id_post) as id_post FROM post`);
  const result = await executeQuery(conn, `UPDATE post SET email='${email}', judul_post='${judul_post}', caption_post='${caption_post}', app_id='${app_id}' WHERE id_post=${lastPost[0].id_post}`);
  conn.release();
  return result;
}

async function insertLastPostIMG(img_path){
  const conn = await getConnection();
  const lastPost = await executeQuery(conn, `SELECT MAX(id_post) as id_post FROM post`);
  const result = await executeQuery(conn, `UPDATE post SET img_path='${lastPost}${img_path}' WHERE id_post=${lastPost[0].id_post} `);
  conn.release();
  return result;
}

async function getLastPost(){
  const conn = await getConnection();
  const lastPost = await executeQuery(conn, `SELECT MAX(id_post) as id_post FROM post`);
  const result = await executeQuery(conn, `SELECT * FROM post WHERE id_post = ${lastPost[0].id_post}`);
  conn.release();
  return result;
}

async function deleteLastPost(){
  const conn = await getConnection();
  const lastPost = await executeQuery(conn, `SELECT MAX(id_post) as id_post FROM post`);
  const result = await executeQuery(conn, `DELETE FROM post WHERE id_post = ${lastPost[0].id_post}`);
  conn.release();
  return result;
}

async function getPost(){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM post`);
  conn.release();
  return result;
}

async function getPostByID(id_post){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM post WHERE id_post = ${id_post}`);
  conn.release();
  return result;
}

async function deletePostByID(id_post){
  const conn = await getConnection();
  const result = await executeQuery(conn, `DELETE FROM post WHERE id_post = ${id_post}`);
  conn.release();
  return result;
}

async function updatePost(id_post, judul, caption){
  const conn = await getConnection();
  const result = await executeQuery(conn, `UPDATE post SET judul_post='${judul}', caption_post='${caption}' WHERE id_post = ${id_post}`);
  conn.release();
  return result;
}

async function reviewPost(id_post, comment){
  const conn = await getConnection();
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  const result = await executeQuery(conn, `INSERT INTO review_post values('',${id_post},'${comment}','${dateTime}')`);
  conn.release();
  return result;
}

async function getLastReview(){
  const conn = await getConnection();
  const lastReview = await executeQuery(conn, `SELECT MAX(id_review) as id_review FROM review_post`);
  const result = await executeQuery(conn, `SELECT * FROM review_post WHERE id_review = ${lastReview[0].id_review}`);
  conn.release();
  return result;
}

async function getPostByEmail(email){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM post WHERE email = '${email}'`);
  conn.release();
  return result;
}

async function getReviewByID(id_post){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM review_post WHERE id_post = '${id_post}'`);
  conn.release();
  return result;
}

async function getLikedPost(id_post,email){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM like_post WHERE id_post = '${id_post}' AND email='${email}'`);
  conn.release();
  return result;
}

async function getDislikedPost(id_post,email){
  const conn = await getConnection();
  const result = await executeQuery(conn, `SELECT * FROM dislike_post WHERE id_post = '${id_post}' AND email='${email}'`);
  conn.release();
  return result;
}

async function deleteLikedPost(id_post,email){
  const conn = await getConnection();
  const result = await executeQuery(conn, `DELETE FROM like_post WHERE id_post = '${id_post}' AND email='${email}'`);
  conn.release();
  return result;
}

async function deleteDislikedPost(id_post,email){
  const conn = await getConnection();
  const result = await executeQuery(conn, `DELETE FROM dislike_post WHERE id_post = '${id_post}' AND email='${email}'`);
  conn.release();
  return result;
}

async function insertLikedPost(id_post,email){
  const conn = await getConnection();
  const result = await executeQuery(conn, `INSERT INTO like_post VALUES('','${id_post}','${email}')`);
  conn.release();
  return result;
}

async function insertDislikePost(id_post,email){
  const conn = await getConnection();
  const result = await executeQuery(conn, `INSERT INTO dislike_post VALUES('','${id_post}','${email}')`);
  conn.release();
  return result;
}

module.exports = {
  getUser: getUser,
  getWishlist: getWishlist,
  insertWishlist: insertWishlist,
  deleteWishlist: deleteWishlist,
  getHistory: getHistory,
  insertHistory: insertHistory,
  updateHistory: updateHistory,
  login_user : login_user,
  register_user : register_user,
  update_profile : update_profile,
  upgrade_user : upgrade_user,
  make_vote : make_vote,
  insert_vote : insert_vote,
  input_vote : input_vote,
  get_ranking_vote : get_ranking_vote,
  deleteWishlist: deleteWishlist,
  insertPost: insertPost,
  insertLastPostIMG: insertLastPostIMG,
  getLastPost: getLastPost,
  getPost: getPost,
  deleteLastPost: deleteLastPost,
  updateLast: updateLast,
  getPostByID: getPostByID,
  deletePostByID: deletePostByID,
  updatePost: updatePost,
  reviewPost: reviewPost,
  getLastReview: getLastReview,
  getPostByEmail: getPostByEmail,
  getReviewByID: getReviewByID,
  getLikedPost: getLikedPost,
  getDislikedPost: getDislikedPost,
  deleteDislikedPost: deleteDislikedPost,
  deleteLikedPost: deleteLikedPost,
  insertLikedPost: insertLikedPost,
  insertDislikePost: insertDislikePost
}
var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.session && req.session.user) {
    res.json({version: '0.0.1'});
  } else {
    res.render('index.jade', { title: 'Flock' });
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.reset();
  }
  res.redirect('/api');
})

module.exports = router;

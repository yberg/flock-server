var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

/* GET home page. */
router.get('/', (req, res, next) => {
  res.jsonp({version: '0.0.1'});
});

module.exports = router;

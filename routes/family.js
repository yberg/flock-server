var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var Families;
mongoClient.connect('mongodb://localhost:27017/flock', (err, db) => {
  if (err) {
    throw err;
  }
  Families = db.collection('families');
});

router.get('/', (req, res, next) => {
  res.jsonp({
    success: true,
    favorites: []
  });
});

router.get('/all', (req, res, next) => {
  Families.find().toArray((err, result) => {
    if (err) {
      throw err;
    }
    result.success = true;
    res.jsonp(result);
  });
});

/* GET home page. */
router.get('/:_id', (req, res, next) => {
  var _id = {};
  if (req.params._id) {
    _id = {_id: ObjectId(req.params._id)};
  }
  Families.find(_id).toArray((err, result) => {
    if (err) {
      throw err;
    }
    result.success = true;
    if (req.params._id) {
      result = result[0];
    }
    res.jsonp(result);
  });
});

module.exports = router;

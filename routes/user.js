var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var Users;
mongoClient.connect('mongodb://localhost:27017/flock', (err, db) => {
  if (err) {
    throw err;
  }
  Users = db.collection('users');
});

/* GET home page. */
router.get('/', (req, res, next) => {
  var family = {};
  if (req.query.familyId) {
    family = {familyId: ObjectId(req.query.familyId)};
  } else if (req.query.familyId === '') {
    family = {familyId: '_'};
  }
  Users.find(family).toArray((err, result) => {
    if (err) {
      throw err;
    }
    if (req.headers._id) {
      // Filter out requesting user
      result = result.filter(function(user) {
        return user._id != req.headers._id;
      });
    }
    res.jsonp({
      success: true,
      users: result,
    });
  });
});

module.exports = router;

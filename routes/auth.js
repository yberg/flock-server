var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;
var request = require('request');

const CLIENT_ID = require('../config').clientId;
const CLIENT_ID_URL = CLIENT_ID + '.apps.googleusercontent.com';

var Users;
mongoClient.connect('mongodb://localhost:27017/flock', (err, db) => {
  if (err) {
    throw err;
  }
  Users = db.collection('users');
});

function validateToken(idToken, callback) {
  var options = {
    url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    form: {'id_token': idToken}
  };
  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      callback(JSON.parse(body));
    } else {
      callback(false);
    }
  });
}

router.post('/', (req, res, next) => {
  console.log(req.body);
  var user = {};
  if (req.body.email) {
    Users.findOne({email: req.body.email}, (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
        result.success = true;
      } else {
        var result = {
          success: false,
          message: 'Couldn\'t find user',
        };
      }
      res.jsonp(result);
    });
  } else if (req.body.gmail) {
    validateToken(req.body.idToken, (googleRes) => {
      console.log(googleRes);
      if (googleRes && googleRes.aud === CLIENT_ID) {
        Users.findOne({gmail: req.body.gmail}, (err, result) => {
          if (err) {
            throw err;
          }
          if (result) {
            result.success = true;
          } else {
            var newGoogleUser = {
              gmail: req.body.gmail,
              name: req.body.name,
            };
            Users.insert(newGoogleUser);
            result = newGoogleUser;
            result.success = true;
          }
          res.jsonp(result);
        });
      } else {
        res.jsonp({
          success: false,
          message: 'Failed to authenticate user',
        });
      }
    });
  } else {
    res.jsonp({
      success: false,
      message: 'Couldn\'t find user',
    });
  }
});

module.exports = router;

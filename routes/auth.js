var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;
var request = require('request');

const CLIENT_ID = require('../config').clientId;

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2(CLIENT_ID, '', '');

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
    client.verifyIdToken(req.body.idToken, CLIENT_ID, function(err, login) {
      if (err) {
        console.log(err);
      } else {
        var payload = login.getPayload();
        var userid = payload['sub'];
        console.log(payload);
        Users.findOne({gmail: req.body.gmail}, (err, result) => {
          if (err) {
            throw err;
          }
          if (result) {
            result.success = true;
          } else {
            var newGoogleUser = {
              gmail: payload.email,
              googleId: payload.sub,
              name: payload.name,
              firstName: payload.given_name,
              lastName: payload.family_name,
              familyId: ObjectId('5804c0fc795236fdc199b614')
            };
            Users.insert(newGoogleUser);
            result = newGoogleUser;
            result.success = true;
          }
          res.jsonp(result);
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

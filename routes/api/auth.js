var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var request = require('request');
var cookieParser = require('cookie-parser');
var bcrypt = require('bcryptjs');

const CLIENT_ID = require('../../config').clientId;
const utils = require('./utils');

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2(CLIENT_ID, '', '');

router.post('/', (req, res, next) => {
  console.log(req.body);
  const { Users } = res;
  var user = {};
  if (req.body.email) {
    Users.findOne({ email: req.body.email }, (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
        if (bcrypt.compareSync(req.body.password, result.password)) {
          delete result.password;
          const user = Object.assign({}, result);
          utils.createUserSession(req, res, {
            _id: user._id,
            email: user.email,
          });
          result.success = true;
          console.log('sending back', result);
          res.json(result);
        } else {
          res.json({
            success: false,
            error: 'Wrong username and/or password',
          });
        }
      } else {
        res.json({
          success: false,
          error: 'Wrong username and/or password',
        });
      }
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
            Users.updateOne({gmail: req.body.gmail}, {$set: {googleImageUrl: payload.picture}});
            utils.createUserSession(req, res, {
              _id: result._id,
              gmail: result.gmail,
            });
          } else {
            const newGoogleUser = {
              gmail: payload.email,
              googleId: payload.sub,
              name: payload.name,
              firstName: payload.given_name,
              lastName: payload.family_name,
              familyId: ObjectID('5804c0fc795236fdc199b614'),
              googleImageUrl: payload.picture
            };
            Users.insert(newGoogleUser);
            result = newGoogleUser;
            // TODO: get new user's _id and create session
          }
          result.success = true;
          res.json(result);
        });
      }
    });
  } else {
    res.json({
      success: false,
      message: 'Couldn\'t find user',
    });
  }
});

module.exports = router;

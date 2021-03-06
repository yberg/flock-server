var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var request = require('request');
var bcrypt = require('bcryptjs');

router.post('/', (req, res, next) => {
  console.log('Register', req.body);
  const { Users } = res;
  Users.findOne({email: req.body.email}, (err, result) => {
    if (err) {
      throw err;
    }
    if (result) {
      res.jsonp({
        success: false,
        error: 'EMAIL_EXISTS',
      });
    } else {
      const user = {
        email: req.body.email,
        name: req.body.firstName + ' ' + req.body.lastName,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: bcrypt.hashSync(req.body.password, 10),
      };
      Users.insertOne(user, (err, result) => {
        if (err) {
          throw err;
        }
        delete user.password;
        user.success = true;
        res.jsonp(user);
      });
    }
  });
});

module.exports = router;

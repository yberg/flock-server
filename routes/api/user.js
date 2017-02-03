const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const utils = require('./utils');

/* GET home page. */
router.get('/', utils.requireLogin, (req, res, next) => {
  const { Users } = res;
  var family = {};
  if (req.query.familyId) {
    family = { familyId: ObjectId(req.query.familyId) };
  } else if (req.query.familyId === '') {
    family = { familyId: '_' };
  }
  Users.find(family).toArray((err, result) => {
    if (err) {
      throw err;
    }
    if (req.headers._id) {
      // Filter out requesting user
      result = result.filter(function(user) {
        return user._id !== req.headers._id;
      });
    }
    res.json({
      success: true,
      users: result,
    });
  });
});

router.get('/:id', utils.requireLogin, (req, res, next) => {
  const { Users } = res;
  Users.findOne({ _id: ObjectId(req.params.id) }, (err, result) => {
    if (err) {
      throw err;
    }
    if (result) {
      result.success = true;
      res.json(result);
    } else {
      res.json({
        success: false,
        error: 'Couldn\'t find user'
      });
    }
  });
});

router.post('/:id/edit', (req, res, next) => {
  const { Users } = res;
  Users.findOne({ _id: ObjectId(req.params.id) }, (err, result) => {
    if (err) {
      throw err;
    }
    if (bcrypt.compareSync(req.body.password, result.password)) {
      Users.updateOne(
        { _id: ObjectId(req.params.id) },
        { $set: { password: bcrypt.hashSync(req.body.newPassword, 10) } },
        (err, result) => {
          if (err) {
            throw err;
          }
          if (result) {
            res.json({
              success: true,
              message: 'Updated password'
            });
          } else {
            res.json({
              success: false,
              error: 'Failed to update password'
            });
          }
        }
      );
    }
  });
});

module.exports = router;

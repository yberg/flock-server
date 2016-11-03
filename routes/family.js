var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var Families;
var Users;
mongoClient.connect('mongodb://localhost:27017/flock', (err, db) => {
  if (err) {
    throw err;
  }
  Families = db.collection('families');
  Users = db.collection('users');
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

router.post('/:id/addFavorite', (req, res, next) => {
  console.log(req.body);
  if (req.body) {
    // Look up requesting user
    Users.findOne({_id: ObjectId(req.body._id)}, {familyId: 1}, (err, result) => {
      if (err) {
        throw err;
      }
      // Check if the user is a member of the family
      if (result.familyId && result.familyId.toString() === req.params.id) {
        // Push the new favorite to the favorites list
        Families.updateOne({_id: ObjectId(req.params.id)},
        {$push: {favorites: {
          _id: ObjectId(),
          name: req.body.name,
          lat: req.body.lat,
          long: req.body.long,
          radius: req.body.radius
        }}}, (err, result) => {
          if (err) {
            throw err;
          }
          res.jsonp({
            success: true,
            message: 'Added favorite'
          });
        });
      } else {
        res.jsonp({
          success: false,
          message: 'Couldn\'t add favorite #1',
        });
      }
    });
  } else {
    res.jsonp({
      success: false,
      message: 'Couldn\'t add favorite #2',
    });
  }
});

router.post('/:id/deleteFavorite', (req, res, next) => {
  console.log(req.body);
  if (req.body) {
    // Look up requesting user
    Users.findOne({_id: ObjectId(req.body._id)}, {familyId: 1}, (err, result) => {
      if (err) {
        throw err;
      }
      // Check if the user is a member of the family
      if (result.familyId && result.familyId.toString() === req.params.id) {
        // Delete the favorite from the favorites list
        Families.updateOne({_id: ObjectId(req.params.id)},
        {$pull: {favorites: {
          _id: ObjectId(req.body.favoriteId),
        }}}, (err, result) => {
          if (err) {
            throw err;
          }
          res.jsonp({
            success: true,
            message: 'Deleted favorite'
          });
        });
      } else {
        res.jsonp({
          success: false,
          message: 'Couldn\'t add favorite #1',
        });
      }
    });
  } else {
    res.jsonp({
      success: false,
      message: 'Couldn\'t add favorite #2',
    });
  }
});

module.exports = router;

var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

const utils = require('../utils');

var Families;
var Users;
mongoClient.connect('mongodb://localhost:27017/flock', (err, db) => {
  if (err) {
    throw err;
  }
  Families = db.collection('families');
  Users = db.collection('users');
});

router.get('/', utils.requireLogin, (req, res, next) => {
  res.json({
    success: true,
    favorites: []
  });
});

router.get('/all', utils.requireLogin, (req, res, next) => {
  Families.find().toArray((err, result) => {
    if (err) {
      throw err;
    }
    result.success = true;
    res.json(result);
  });
});

/* GET home page. */
router.get('/:id', utils.requireLogin, (req, res, next) => {
  Families.findOne({ _id: ObjectId(req.params.id) }, (err, result) => {
    if (err) {
      throw err;
    }
    if (result) {
      result.success = true;
      res.json(result);
    } else {
      res.json({
        success: false,
        error: 'Could\'nt find family'
      });
    }
  });
});

router.post('/:id/join', utils.requireLogin, (req, res, next) => {
  console.log('Join family', req.body);
  Families.findOne({ _id: ObjectId(req.params.id) }, (err, result) => {
    if (err) {
      throw err;
    }
    if (result) {
      Users.findOneAndUpdate(
        { _id: ObjectId(req.body._id) },
        { $set: { familyId: ObjectId(req.params.id) } },
        (err, result) => {
        if (err) {
          throw err;
        }
        if (result && result.value) {
          delete result.value.password;
          result.value.success = true;
          result.value.familyId = req.params.id;
          res.json(result.value);
        } else {
          res.json({
            success: false,
            error: 'User not found',
          });
        }
      });
    } else {
      res.json({
        success: false,
        error: 'Family not found',
      })
    }
  })
});

router.post('/:id/addFavorite', utils.requireLogin, (req, res, next) => {
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
          lat: Number(req.body.lat),
          long: Number(req.body.long),
          radius: Number(req.body.radius)
        }}}, (err, result) => {
          if (err) {
            throw err;
          }
          Families.findOne({_id: ObjectId(req.params.id)}, {_id: 0, favorites: 1}, (err, result) => {
            if (err) {
              throw err;
            }
            const favorite = result.favorites[result.favorites.length - 1];
            favorite.success = true;
            favorite.message = 'Added favorite';
            res.json(favorite);
          });
        });
      } else {
        res.json({
          success: false,
          error: 'Couldn\'t add favorite #1',
        });
      }
    });
  } else {
    res.json({
      success: false,
      error: 'Couldn\'t add favorite #2',
    });
  }
});

router.post('/:id/deleteFavorite', utils.requireLogin, (req, res, next) => {
  console.log(req.body);
  if (req.body) {
    // Look up requesting user
    Users.findOne({_id: ObjectId(req.body._id)}, {familyId: 1}, (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
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
            res.json({
              success: true,
              message: 'Deleted favorite'
            });
          });
        } else {
          res.json({
            success: false,
            error: 'Couldn\'t delete favorite #1',
          });
        }
      } else {
        res.json({
          success: false,
          error: 'Couldn\'t delete favorite #2',
        });
      }
    });
  } else {
    res.json({
      success: false,
      error: 'Couldn\'t delete favorite #3',
    });
  }
});

module.exports = router;

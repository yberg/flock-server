var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;

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
    _id = {_id: ObjectID(req.params._id)};
  }
  Families.find(_id).toArray((err, result) => {
    if (err) {
      throw err;
    }
    result.success = true;
    if (req.params._id) {
      result = result[0];
    }
    console.log('family result:', result);
    res.jsonp(result);
  });
});

router.post('/:id/join', (req, res, next) => {
  console.log('Join family', req.body);
  Families.findOne({_id: ObjectID(req.params.id)}, (err, result) => {
    if (err) {
      throw err;
    }
    if (result) {
      Users.findOneAndUpdate(
        {_id: ObjectID(req.body._id)},
        {$set: {familyId: ObjectID(req.params.id)}},
        (err, result) => {
        if (err) {
          throw err;
        }
        if (result && result.value) {
          delete result.value.password;
          result.value.success = true;
          result.value.familyId = req.params.id;
          res.jsonp(result.value);
        } else {
          res.jsonp({
            success: false,
            error: 'User not found',
          });
        }
      });
    } else {
      res.jsonp({
        success: false,
        error: 'Family not found',
      })
    }
  })
});

router.post('/:id/addFavorite', (req, res, next) => {
  console.log(req.body);
  if (req.body) {
    // Look up requesting user
    Users.findOne({_id: ObjectID(req.body._id)}, {familyId: 1}, (err, result) => {
      if (err) {
        throw err;
      }
      // Check if the user is a member of the family
      if (result.familyId && result.familyId.toString() === req.params.id) {
        // Push the new favorite to the favorites list
        Families.updateOne({_id: ObjectID(req.params.id)},
        {$push: {favorites: {
          _id: ObjectID(),
          name: req.body.name,
          lat: Number(req.body.lat),
          long: Number(req.body.long),
          radius: Number(req.body.radius)
        }}}, (err, result) => {
          if (err) {
            throw err;
          }
          Families.findOne({_id: ObjectID(req.params.id)}, {_id: 0, favorites: 1}, (err, result) => {
            if (err) {
              throw err;
            }
            const favorite = result.favorites[result.favorites.length - 1];
            favorite.success = true;
            favorite.message = 'Added favorite';
            res.jsonp(favorite);
          });
        });
      } else {
        res.jsonp({
          success: false,
          error: 'Couldn\'t add favorite #1',
        });
      }
    });
  } else {
    res.jsonp({
      success: false,
      error: 'Couldn\'t add favorite #2',
    });
  }
});

router.post('/:id/deleteFavorite', (req, res, next) => {
  console.log(req.body);
  if (req.body) {
    // Look up requesting user
    Users.findOne({_id: ObjectID(req.body._id)}, {familyId: 1}, (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
        // Check if the user is a member of the family
        if (result.familyId && result.familyId.toString() === req.params.id) {
          // Delete the favorite from the favorites list
          Families.updateOne({_id: ObjectID(req.params.id)},
          {$pull: {favorites: {
            _id: ObjectID(req.body.favoriteId),
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
            error: 'Couldn\'t delete favorite #1',
          });
        }
      } else {
        res.jsonp({
          success: false,
          error: 'Couldn\'t delete favorite #2',
        });
      }
    });
  } else {
    res.jsonp({
      success: false,
      error: 'Couldn\'t delete favorite #3',
    });
  }
});

module.exports = router;

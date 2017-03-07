var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

router.use('/socket', require('./socket'));
router.use('/test', require('./test'));
router.use('/user', require('./user'));
router.use('/family', require('./family'));
router.use('/auth', require('./auth'));
router.use('/register', require('./register'));
router.use('/session', require('./session'));

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.session && req.session.user) {
    res.render('welcome.jade');
  } else {
    res.render('index.jade', { title: 'Flock' });
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.reset();
  }
  res.redirect('/api');
})

module.exports = router;

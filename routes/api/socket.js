var express = require('express');
var router = express.Router();

/* GET socket listing. */
router.get('/', function(req, res, next) {
  res.send('connected');
});

router.get('/updateOne', (req, res, next) => {
  phone.emit('updateRequest');
});

module.exports = router;

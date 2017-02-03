var router = require('express').Router();
var bodyParser = require('body-parser');

router.get('/', (req, res, next) => {
  res.json({ session: req.session })
});

module.exports = router;

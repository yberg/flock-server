module.exports.createUserSession = function(req, res, user) {
  console.log('CREATING USER SESSION FOR', user.email || user.gmail);
  req.session.user = user;
};

module.exports.requireLogin = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/api');
  }
};

'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const session = require('client-sessions');

var app = express();

/*const options = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt'),
  ca: fs.readFileSync('./ssl/ca.crt')
};
var httpsServer = require('https').createServer(options, app);*/
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Users, Families;
var sockets = {};
mongoClient.connect('mongodb://localhost:27017/flock', (err, db) => {
  if (err) {
    throw err;
  }
  Users = db.collection('users');
  Families = db.collection('families');

  // Init socket.io
  require('./io').init(io, sockets, Users);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req, res, next) {
  res.Users = Users;
  res.Families = Families;
  next();
});
app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(session({
  cookieName: 'session',
  secret: 'LupuXg9oZFUgoreW0Vg22uwEphPvc37jk+w6W0HN75A=',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true
}));

app.get(['/', '/join', '/join/:id'], (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});
app.use('/api/', require('./routes/api/index'));
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = { app: app, server: server/*, httpsServer: httpsServer*/ };

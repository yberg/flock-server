const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const index = require('./routes/index');
const socket = require('./routes/socket');
const test = require('./routes/test');
const user = require('./routes/user');
const family = require('./routes/family');
const auth = require('./routes/auth');
const register = require('./routes/register');

var app = express();

/*const options = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt'),
  ca: fs.readFileSync('./ssl/ca.crt')
};
var httpsServer = require('https').createServer(options, app);*/
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Users;
var sockets = {};
var _ids = {};
mongoClient.connect('mongodb://localhost:27017/flock', (err, db) => {
  if (err) {
    throw err;
  }
  Users = db.collection('users');
});

io.on('connection', (socket) => {
  console.log(socket.handshake.address + ' connected');
  var _id = socket.handshake.query._id;
  console.log(_id);
  sockets[_id] = socket;
  console.log('Connected devices: ');
  console.log(Object.keys(sockets));
  io.emit('newConnection',
    {connection: 'New connection from ' + socket.handshake.address});
  socket.on('requestOne', (data) => {
    // Someone requests update from another user
    console.log('requested update from ' + data.src + ' on ' + data.dest);
    if (sockets[data.dest] !== undefined) {
      // Send the request to that user only
      sockets[data.dest].emit('updateRequest', {src: data.src});
    } else {
      socket.emit('socketError', {error: 'Device not connected'});
    }
    // TODO: handle case where user is not connected
    // if (sockets[data.dest] === null)
  }).on('updateSelf', (data) => {
    // One user updated it's location
    if (data._id && data.lat && data.long) {
      // Update database
      Users.updateOne({_id: ObjectId(data._id)},
        {$set: {
          lat: data.lat,
          long: data.long,
          lastUpdated: new Date()
        }}, (err, result) => {
          if (err) { throw err; }
          //console.log('updateSelf: ');
          //console.log(data);
          // Send update to the requesting user (if there is one)
          Users.findOne({_id: ObjectId(data._id)}, (err, result) => {
            if (err) { throw err; }
            if (result) {
              if (data.dest) {
                sockets[data.dest].emit('updatedOne', result);
              } else {
                socket.broadcast.emit('updatedOne', result);
              }
            }
          });
        }
      );
    }
  }).on('disconnect', () => {
    delete sockets[socket.handshake.query._id];
    console.log(socket.handshake.address + ' disconnected');
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req, res, next) {
  res.io = io;

  // Access-Control-Allow-Origin
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);

  next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/socket', socket);
app.use('/test', test);
app.use('/user', user);
app.use('/family', family);
app.use('/auth', auth);
app.use('/register', register);

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

module.exports = {app: app, server: server/*, httpsServer: httpsServer*/};

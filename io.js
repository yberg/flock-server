'use strict';

const ObjectId = require('mongodb').ObjectId;

module.exports.init = function(io, sockets, Users) {
  io.on('connection', (socket) => {
    console.log(socket.handshake.address + ' connected');
    var _id = socket.handshake.query._id;
    console.log(_id);
    sockets[_id] = socket;
    console.log('Connected devices: ');
    console.log(Object.keys(sockets));
    io.emit('newConnection',
      { connection: 'New connection from ' + socket.handshake.address });
    socket.on('requestOne', (data) => {
      // Someone requests update from another user
      console.log('requested update from ' + data.src + ' on ' + data.dest);
      if (sockets[data.dest] !== undefined) {
        // Send the request to that user only
        sockets[data.dest].emit('updateRequest', { src: data.src });
      } else {
        socket.emit('socketError', { error: 'Device not connected' });
      }
      // TODO: handle case where user is not connected
      // if (sockets[data.dest] === null)
    }).on('updateSelf', (data) => {
      // One user updated it's location
      console.log('updateSelf', data._id);
      if (data._id && data.lat && data.long) {
        // Update database
        Users.updateOne({ _id: ObjectId(data._id) },
          { $set: {
            lat: data.lat,
            long: data.long,
            lastUpdated: new Date()
          } }, (err, result) => {
            if (err) { throw err; }
            // Send update to the requesting user (if there is one)
            Users.findOne({ _id: ObjectId(data._id) }, (err, result) => {
              if (err) { throw err; }
              if (result) {
                delete result.success;
                delete result.password;
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
}

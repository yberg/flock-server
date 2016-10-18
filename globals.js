var Globals = {
  success: true,
  places: [
    {
      name: 'Hem',
      lat: 59.506722,
      long: 17.756990
    }
  ],
  members: [
    {
      _id: ObjectId(),
      name: 'Viktor',
      lat: 59.506106,
      long: 17.753817,
      lastUpdated: '2016-10-10T12:39:18.789Z'
    },
    {
      _id: ObjectId(),
      name: 'Josefine',
      lat: 59.508594,
      long: 17.755809,
      lastUpdated: '2016-10-10T12:37:15.789Z'
    }
  ]
};

module.exports = Globals;

/**
 * TODO: Implement schema
 * Phone:
 *   send:
 *     requestOne: Request updated member location
 *     updateSelf: Update self location
 *   receive:
 *     updateOne: Updated member location
 * Server:
 *   send:
 *     updateOne: Send updated member location
 *   receive:
 *     requestOne: Read member location and socket.emit back to sender
 *     updateSelf: Update member location and possibly send 'updateOne' to requesting user
 */

// A
// db.life.update({'members.name': 'Viktor'}, {$set: {'members.$._id': ObjectId()}});

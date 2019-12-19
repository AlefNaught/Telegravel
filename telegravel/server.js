const express = require("express");
let app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fs = require("fs");
var moment = require('moment');
users = [];
staffusers = [];
connections = [];

/*
 Make a socket for staff and a room.
 Have client broadcast messages to the staff room
 with date/time.
Vice versa

Client -> Server -> Staff
Staff -> Server -> Client
 */

app.use(express.static("public"));

server.listen(3000, function() {
  console.log("NODEJS: Listening on 3000");
});

//connect
io.on("connection", function(socket) {
  connections.push(socket);
  console.log("Connected: %s sockets connected.", connections.length);

  //disconnect
  socket.on("disconnect", function(data) {
    users.splice(users.indexOf(socket.username), 1);
    updateUsers();
    connections.splice(connections.indexOf(socket), 1);
    console.log("Disconnected: %s sockets connected.", connections.length);
  });

  //send message
  socket.on("send message", function(data) {
    console.log(data);
    if (data.type == "staff" && data.target == "staff") {
      io.sockets.to("staff").emit("new message", {
        msg: data.value + " || " + moment().format('LLLL'),
        type: data.type,
        user: socket.username
      });
    } else {
      io.sockets.emit("new message", {
        msg: data.value + " ||  " + moment().format('LLLL'),
        type: data.type,
        user: socket.username
      });
    }
  });

  //user
  socket.on("new user", function(data, callback) {
    callback(true);
    socket.username = data.value;
    if (data.type == "staff") {
      socket.join("staff");
    }
    users.push({
      type: data.type,
      name: socket.username
    });
    updateUsers();
  });

  function updateUsers() {
    io.sockets.emit("get users", users);
  }
});

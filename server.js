const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const upload = require('./utils/upload');
const mongoose = require('mongoose');
const fs = require('fs');
const multer = require('multer');
var bodyParser = require('body-parser');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

var username="";
var room="";
const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


const server = http.createServer(app);
const io = socketio(server);
//connecting database
mongoose.connect('mongodb://localhost/chat', function(err) {
  if(err){
    console.log(err);
  }else{
    console.log('connected to db');
  }
});

app.get('/', (req, res) => {
  res.render("index");
});

app.post('/chat', (req, res) => {
  username=req.body.username;
  room=req.body.room;
  res.render("chat");
});

var chatSchema = mongoose.Schema({
  username: String,
  room: String,
  time: { type: Date, default: Date.now},
  text: String
});

var savechat = mongoose.model("Savechat", chatSchema);

const botName = 'ChatBoard';
var fileup = "";

// Run when client connects
io.on('connection', socket => {
  console.log("new user connected");
  socket.emit('joinRoom', ({ username, room }) => {

  savechat.find({room: room}, function(err, docs){
    if(err) console.log(err);

    socket.emit('load old msgs', docs);
    });

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);


    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatBoard!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });

    socket.on('typing', function(username) {
      socket.broadcast
      .to(user.room)
      .emit(
        'typing',
        username
      );

    });

 });
 app.post('/upload', (req, res) => {
  console.log("hello post");
 })

  // Listen for chatMessage
  socket.on('chatMessage', data => {
  
    const user = getCurrentUser(socket.id);
    var newMsg = new savechat({ username: user.username, text: data.msg, room: user.room});
    newMsg.save(function(err){
      if(err) console.log(err);

      io.to(user.room).emit('message',  formatMessage(user.username, data.msg) );
    })

    
  });


  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));








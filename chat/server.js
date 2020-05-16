const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const upload = require('./utils/upload');
const mongoose = require('mongoose');
const exphbs=require('express-handlebars');
const bodyparser=require('body-parser');
const fs = require('fs');

const chatRouter=require('./routes/chatRouter');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

var username="";
var room="";

app.use(bodyparser.json());
//will not shown in search bar
app.use(bodyparser.urlencoded({
    extended:true
    }));


app.set('views',path.join(__dirname,'/views/'));
app.engine('hbs',exphbs({extname:'hbs',defaultLayout:'mainLayout',layoutDir:__dirname+'/views/layouts/'}));
app.set('view engine','hbs');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', (req, res) => {
    console.log('post indec');
    username=req.body.username;
    room=req.body.room;
    res.redirect('chat');
});

//app.get('/chat', (req, res) => {
//    console.log('hello get');
//    res.render('chat');
//});
//
//app.post('/chat', (req, res) => {
//    console.log('hello post');
//    res.redirect('index');
//})

app.use('/chat',chatRouter);


//connecting database
mongoose.connect('mongodb://localhost/chat', function(err) {
  if(err){
    console.log(err);
  }else{
    console.log('connected to db');
  }
});

var chatSchema = mongoose.Schema({
  username: String,
  room: String,
  time: { type: Date, default: Date.now},
  text: String
});

var savechat = mongoose.model("Savechat", chatSchema);

const botName = 'ChatBoard';

// Run when client connects
io.on('connection', socket => {
  socket.emit('joinRoom', { username, room } );

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


  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    var newMsg = new savechat({ username: user.username, text: msg, room: user.room});
    newMsg.save(function(err){
      if(err) console.log(err);

      io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    
  });

  // socket.on('img-chunk', chunk => {
  //   const user = getCurrentUser(socket.id);
  //   io.to(user.room).emit('receive-img', chunk);
  // })

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

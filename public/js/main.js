//including jquery
// var script = document.createElement('script');
// script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
// script.type = 'text/javascript';
// document.getElementsByTagName('head')[0].appendChild(script);




const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const feedback = document.getElementById('feedback');


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});



msg.addEventListener('keypress', function(){
  socket.emit('typing', username);
});

socket.on('typing', function(username) {
  feedback.innerHTML = '<p><em>'+username+ ' is typing a message..</em></p>'
})


// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;
  const file = e.target.elements.file;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();// focuses on empty input nby blinking cursor
});

socket.on('load old msgs', function(docs){
  for(var i=0;i<docs.length;i++){
    outputMessage(docs[i]);
  }
})

// Output message to DOM
function outputMessage(message) {
  feedback.innerHTML = "";
  const div = document.createElement('div');
  div.classList.add('message'); //seting up the class
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// var imgChunks = [];
// function outputImg(chunk){
//   var imgdiv = document.getElementById('img-messages');
//   var img = document.createElement('img');
//   imgChunks.push(chunk);
//   img.setAttribute('src', 'data:image/jpeg;base64', +window.btoa(imgChunks));
//   imgdiv.appendChild(img);
// }

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
 
 
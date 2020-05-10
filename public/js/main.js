const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const file = document.getElementById('file');





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

// socket.on('receive-img', chunk => {
//   outputImg(chunk);
// })

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

//   $('#file').change(function(e){
//     var readStream = fs.createReadStream(path.resolve(__dirname, './green.jpg'), {
//     encoding: 'binary'
//   }), chunks = [];

//   readStream.on('readable', function() {
//     console.log('img loading');
//   });

//   readStream.on('data', function(chunk) {
//     chunk.push(chunk);
//     socket.emit('img-chunk', chunk);
//   });

//   readStream.on('end', function() {
//     console.log('img uploaded');
//   });

// });

  // Get message text
  const msg = e.target.elements.msg.value;

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
 
 
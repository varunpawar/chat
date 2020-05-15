const roomForm = document.getElementById('room-form');

var username="";
var room="";

roomForm.addEventListener('submit', e => {

   username = e.target.elements.username.value;
   room = e.target.elements.room.value;

   console.log(room);
});


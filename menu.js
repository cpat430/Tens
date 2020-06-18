var socket = io(); 

// Get the modal
var modal = document.getElementById("myModal");

// When the user clicks on the button, open the modal
function showModal() {
    modal.style.display = "block";
}

function closeModal( ){
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}

function checkRoomExist(roomid) {
    socket.emit('roomExistQuery', roomid);
}

function updatePlayerNames(names) {
    let p = document.getElementById('playerNames');
    if (!names) {
        p.innerHTML = "Loser";
    } else {
        p.innerHTML = names;
    }
}

socket.on('roomExistResult', function(res) {
    console.log('hello');
    console.log(res);
    updatePlayerNames(res);
});

let input = document.getElementById('roomidinput');
input.oninput = function() {
    checkRoomExist(input.value);
    console.log(input.value);
}
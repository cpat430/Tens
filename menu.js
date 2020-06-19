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

let input = document.getElementById('roomidinput');

function updatePlayerNames(names) {
    let grid = document.getElementsByClassName('grid')[0];
    let items = document.getElementsByClassName('room-person');

    if (!names) {
        grid.style.display = "none";
    } else {
        grid.style.display = "flex";
        let order = [0,1,3,2];

        for (let i = 0; i < 4; i++) {
            items[order[i]].innerHTML = names[i];

            items[order[i]].onclick = function() {enterRoom(input.value, i)};
        }
    }
}

socket.on('roomExistResult', function(res) {
    updatePlayerNames(res);
});

input.oninput = function() {
    checkRoomExist(input.value);
}

function enterRoom(roomid, pos) {
    location.href = "/game?roomid=" + roomid + "&pos=" + pos;
    console.log(roomid);
}
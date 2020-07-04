var socket = io(); 

// Get the modal
var modal = document.getElementById("myModal");

// When the user clicks on the button, open the modal
/**
 * Opens the modal that can restart the game
 */
function showModal() {
    modal.style.display = "block";
}

/**
 * Closes the restart game modal
 */
function closeModal( ){
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

let input = document.getElementById('roomidinput');

/**
 * Updates all the player names given a list of the names.
 * @param {string[]} names 
 */
function updatePlayerNames(exist, room, names) {
    let grid = document.getElementsByClassName('grid')[0];
    let items = document.getElementsByClassName('room-person');

    if (!exist) {
        grid.style.display = "none";
    } else {
        grid.style.display = "flex";
        let order = [3,2,0,1];

        for (let i = 0; i < 4; i++) {
            items[order[i]].innerHTML = names[i];

            if (names[i] == '') {
                items[order[i]].classList.add('empty-room-person');
                items[order[i]].classList.remove('full-room-person');
                items[order[i]].onclick = function() {enterRoom(room, i)};
            } else {
                items[order[i]].classList.add('full-room-person');
                items[order[i]].classList.remove('empty-room-person');
                items[order[i]].onclick = function() {};
            }
        }
    }
}

/**
 * Response to 'queryPlayerNames'. If the room does not exist, res is null. else, it returns String array
 * 
 * @param {string[]} res
 */
socket.on('responsePlayerNames', function(exist, room, names) {
    updatePlayerNames(exist, room, names);
});

/**
 * Asks the server for the player names of the room.
 */
input.oninput = function() {
    socket.emit('queryPlayerNames', input.value);
}

/**
 * Gets a random code to assign to the room.
 * 
 * @return {string} str
 */
function getRandomCode() {
    let str = "";
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code_length = 5;
    
    for (let i = 0; i < code_length; i++) {
        str += alphabet[Math.floor(Math.random() * 26)];
    }
    
    return str;
}

/**
 * Allows the client to enter a room with a room id and a position.
 * @param {string} roomid 
 * @param {number} pos 
 */
function enterRoom(roomid, pos) {
    location.href = "/game?roomid=" + roomid + "&pos=" + pos;
}
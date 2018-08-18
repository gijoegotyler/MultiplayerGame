var socket = io.connect('http://10.0.51.218:5000/'); //connect to the server so you can send back info

socket.on('connect', function(data) { //when you connect
  socket.emit('join', 'Hello server from client'); //test the send back
});

// socket.on('die', function(data) {
//   if (data == socket.id) {
//     document.getElementById('ded').style.zindex =
//   }
// });

let movement = {left: false, right: false, down: false, up: false}; //create the variable movement

document.addEventListener('keydown', function(event) { //look for when a key is pressed
  switch (event.keyCode) { //switch case to determine which key
    case 65: //if the A key is pressed
      movement.left = true; //set movement left to true
      break; //stop searching
    case 87: //if the W key is pressed
      movement.up = true; //set movement up to true
      break; //stop searching
    case 68: //if the D key is pressed
      movement.right = true; //set movement right to true
      break; //stop searching
    case 83: //if the S key is pressed
      movement.down = true; //set movement down to true
      break; //stop searching
  }
});
document.addEventListener('keyup', function(event) { //look for when a key is released
  switch (event.keyCode) { //switch case to determine the key
    case 65: //if the key is the A key
      movement.left = false; //set movement left to false
      break; //stop searching
    case 87: //if the key is the W key
      movement.up = false; //set movement up to false
      break; //stop searching
    case 68: //if the key is the D key
      movement.right = false; //set movement right to false
      break; //stop searching
    case 83: //if the key is the S key
      movement.down = false; //set movement down to false
      break; //stop searching
  }
});
let username; //create the variable username

function submitName() { //create the submitName function
  username = document.getElementById('name').value; //grab the input of the username box
  username = username.replace(' ', ''); //remove spaces
  username = username.replace('-', ''); //remove dashes
  username = username.replace('_', ''); //remove underscore
  document.getElementById('name').value = ''; //clear form
  document.getElementById('form').innerHTML = ''; //hide form
  socket.emit('new player', window.innerWidth, window.innerHeight, username); //tell the server there is a new player
  setInterval(function() { //set the interval to send the movement variable
    socket.emit('movement', movement); //send the message movement with the variable movement attached
  }, 10); //set it to go every 1/100th of a second
  if (username == 'microsoftwillalwaysbebetterthanapple') { //if the user admits that microsoft is better than apple
    // let recheck1 = Math.random()*100000; //make a random num
    // socket.emit('egg', 'white', recheck1); //give the user the white egg
    // let check1 = recheck1/2; //anti cheat
    socket.emit('egg', 'white'); //give the user the white egg
  }
  if (username.length >= 30) { //if the username is longer than 29. This is a puzzle becuase it requires a minor "hack"
    // let recheck1 = Math.random()*100000; //make another random num
    // socket.emit('egg', 'green', recheck1); //give them the green egg
    // let check1 = recheck1/2; //anti cheat
    socket.emit('egg', 'green'); //give the user the white egg
  }
}

// socket.on('mecheck', function(reckval, egg) {
//   if (reckval/2 == check1) {
//     key = Math.random()*1000;
//     reval == egg.length*(Math.pow(key, egg.length))
//     socket.emit('recheck', reval, key, egg)
//   }
// });

var canvas = document.getElementById('canvas'); //get the canvas
canvas.width = window.innerWidth; //set the canvas width to be fullscreen
canvas.height = window.innerHeight; //set the canavs height to be fullscreen
var ctx = canvas.getContext('2d'); //get the context of the canvas as 2d
ctx.fillStyle = '#000000'; //set the color to black
ctx.fillRect(0,0,window.innerWidth,window.innerHeight); //fill the background to black

socket.on('state', function(players) { //when the player receives a message called state take the attachment and do the following:
  //console.log('received');
  ctx.fillStyle = '#000000'; //set color to black
  ctx.fillRect(0,0,window.innerWidth,window.innerHeight); //fill the background as black
  ctx.fillStyle = '#ffffff'; //set the color to white
  ctx.fillRect(50,window.innerHeight-100,window.innerWidth-100,20); //draw the first platform
  ctx.fillRect(150,window.innerHeight-170,200,20); //draw the second platform
  ctx.fillRect(window.innerWidth-350,window.innerHeight-170,200,20); //draw the third platform
  ctx.fillRect(450,window.innerHeight-170,window.innerWidth-900,20); // draw the fourth platform
  for (var id in players) { //for the id's in players variable
    var player = players[id]; //get the values of the current player
    let daColor = 'rgb('+player.rval.toString()+', '+player.gval.toString()+', '+player.bval.toString()+')'; //set the daColor variable to the color of the player
    ctx.fillStyle = daColor; //set the fill color to the daColor variable
    ctx.fillRect(player.x,player.y,10,10); //the player
    ctx.font = '15px Sans'; //set the font to Sans and the size to 15px
    ctx.textAlign = 'center'; //set it to center the text
    ctx.fillStyle = '#ffffff'; //set the fill color to white
    if (player.hasWon) { //if the player has won
      ctx.fillStyle = daColor; //set the fill to the body color
    }
    ctx.fillText(player.username, player.x+5, player.y-10); //draw the username centered above the player
    if (id == socket.id) { //if the player being drawn is the user
      let color = {red:'#ff0000', green:'#00ff00', yellow:'#ffff00', orange:'#ffa500', blue:'#0000ff', purple:'#800080', gold:'#d4af37', silver:'#c0c0c0', bronze:'#cd7f32', white:'#ffffff'} //color codes for eggs
      let curX = 75; //current x for drawing the eggs in series
      for (let egg in player.eggs) { //for the eggs
        if (player.eggs[egg] == true) { //if the egg has been gotten
          ctx.beginPath(); //begin a path
          ctx.arc(curX, 75, 50, 0, Math.PI * 2); //draw an arc
          ctx.fillStyle = color[egg]; //fill it according to color
          ctx.fill(); //fill the path which is the arc
          curX += 125; //move the current x
        }
      }
    }
  }
});

window.beforeunload = function() { //before the player quits
  socket.emit('disconnect'); //send the message disconnect to the server with no attachments
}

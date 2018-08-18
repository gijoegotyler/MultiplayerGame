// Dependencies
var express = require('express'); //import express
var http = require('http'); //import http
var path = require('path'); //import path
var socketIO = require('socket.io'); //import socket.io
var app = express(); //new express
var server = http.Server(app); //makes it an http server
var io = socketIO(server); //connects the sockets api
app.set('port', 5000); //sets the port
app.use('/static', express.static(__dirname + '/static')); //makes the directory static
// Routing
app.get('/', function(request, response) { //tests server on start and is used for sending the site
  response.sendFile(path.join(__dirname, '/static/index.html')); //sends the index.html page
});
// Starts the server.
server.listen(5000, function() { //listens for the start of the server
  console.log('Starting server on port 5000'); //prints started server when it gets a response
});

var players = {}; //creats and empty dictionary
io.sockets.on('connection', function(socket) { //when a player connects grab socket id
  socket.on('new player', function(maxW, maxH, user) { //when the player joins the game
    players[socket.id] = { //set the players value in the dictionary to a dictionary of important variables
      maxWidth: maxW-10, //furthest distance the player can go on screen
      maxHeight: maxH, //furthest down a player can go on screen
      username: user, //the player's inputted username
      x: Math.floor(Math.random()*(maxW-100))+50, //where thew player spawns on the x axis
      y: Math.floor(Math.random() * (maxH-100)), //how high the player falls from when he or she spawns in
      rval: Math.floor(Math.random()*240)+1, //r in the rgb values
      gval: Math.floor(Math.random()*240)+1, //g in the rgb values
      bval: Math.floor(Math.random()*240)+1, //b in the rgb values
      terminalr: 10, //the terminal velocity for the right
      accelr: 0.05, //the acceleration for the right
      speedr: 0, //the speed for the right
      terminall: 10, //the terminal velocity for the left
      accell: 0.05, //the acceleration for the left
      speedl: 0, //the speed for the left
      yA: -3, //the y acceleration
      yS: 0, //the y speed
      notThrough: true, //tests if you jump through something
      terminalFall: 5, //terminal falling speed
      grav: 0.05, //strength of gravity
      canJump: false, //if the player can jump
      hasWon: false, //if the player has won the game
      collected: 0, //counts collected eggs
      eggs: {red:false, green:false, yellow:false, orange:false, blue:false, purple:false, gold:false, silver:false, bronze:false, white:false} //maps the eggs collected
    };
  });
  socket.on('movement', function(data) { //when the server receives movement
    var player = players[socket.id] || {}; //grabs the current player variables
    if (data.left) { //if they move left
      player.speedl += player.accell; //increase the speed left
      if (player.speedl > player.terminall) { //if the speed left is greater than the terminal velocity left
        player.speedl = player.terminall; //set the left speed to the terminal velocity
      }
      player.x -= player.speedl; //moves the player by the speed left
      // player.x -= 5;
    }else if (player.speedl > 0) { //if the speed is greater than 0
      player.x -= player.speedl; //deccelerate
      player.speedl -= player.accell; //move by deccelerated speed
    }else { //otherwise
      player.terminall = 10; //reset values
      player.accell = 0.02; //reset values
      player.speedl = 0; //reset values
    }
    // else if (player.x < 0) {
    //   player.x = 0;
    // }

    if (data.up && player.canJump) { //when you press up
      player.yS = player.yA; //jump acceleration added
      player.canJump = false; //stop jumping
      player.notThrough = false; //add important double system
    }else { //if not jumping apply gravity
      player.yS += player.grav; //apply the gravity
    }

    if (player.canJump && player.x > 39 && player.x < player.maxWidth-40 && player.y > player.maxHeight-200) { //if you aren't off the ground don't apply gravity
      player.yS -= player.grav; //cancel out gravity
    }

    if (player.yS > player.terminalFall) { //if the fall speed is greater than the terminal speed
      player.yS = player.terminalFall; //set the speed to the limit
    }

    player.y += player.yS; //move the y by the y speed

    if (player.y > player.maxHeight-110 && player.x > 39 && player.x < player.maxWidth-40 && player.y < player.maxHeight-90) { //set the box collider for the bottom platform
      player.y = player.maxHeight-110; //set the player's height
      player.canJump = true; //reset the jump
      player.notThrough = true; //reset the second check
    }

    if (player.y > player.maxHeight-180 && player.x > 140 && player.x < 350 && player.y < player.maxHeight-160) { //left most second to bottom platform collider
      player.y = player.maxHeight-180; //set the players height to not fall through
      if (player.notThrough) { //run the double check to prevent floating
        player.canJump = true; //reset can jump
      }
      player.notThrough = true; //reset the double check
    }

    if (player.y > player.maxHeight-180 && player.x > 440 && player.x < player.maxWidth-440 && player.y < player.maxHeight-160) { //middle second to bottom platform box collider
      player.y = player.maxHeight-180; //set the height to stop falloing through it
      if (player.notThrough) { //run the double check
        player.canJump = true; //reset the jump
      }
      player.notThrough = true; //reset the double check
    }

    if (player.y > player.maxHeight-180 && player.x > player.maxWidth-350 && player.x < player.maxWidth-140 && player.y < player.maxHeight-160) { //right most second to bottom platform box collider
      player.y = player.maxHeight-180; //set player height so they don't fall through
      if (player.notThrough) { //double check system
        player.canJump = true; //reset the ability to jump
      }
      player.notThrough = true; //reset the double check
    }

    // if (player.y > player.maxHeight) {
    //     delete players[socket.id];
    //     io.sockets.emit('die', socket)
    // }

    // else if (player.y < 0) {
    //   player.y = 0;
    // }
    if (data.right) { //if the user presssing d to go right
      player.speedr += player.accelr; //increase the right speed by the right acceleration
      if (player.speedr > player.terminalr) { //if the right speed is greater than the right terminal velocity
        player.speedr = player.terminalr; //set the righty peed tpo the right velocity
      }
      player.x += player.speedr; //move the player by the right speed
      // player.x += 5;
    }else if (player.speedr > 0) { //if the key is no longer down but the speed is greater than 0
      player.x += player.speedr; // move the player by the speed
      player.speedr -= player.accelr; //deccelerate the right speed by the right acceleration
    }else { //otherwise
      player.terminalr = 10; //reset the terminal right
      player.accelr = 0.02; //reset the acceleration right
      player.speedr = 0; //reset the speed to the right
    }
    if (player.hasWon) { //if the player has won the game
      player.rval = Math.floor(Math.random()*240)+1; //randomize the red value
      player.gval = Math.floor(Math.random()*240)+1; //randomize the green value
      player.bval = Math.floor(Math.random()*240)+1; //randomize the blue value
    }

    if (player.x < 0 && player.y < player.maxHeight-150 && player.eggs['red'] == false) { //if it meets reqs for red egg
        player.eggs['red'] = true; //give the red egg
        player.y = 0; //respawn player's y
        player.x = player.maxWidth; //respawn player's x
        if (data.right) { //make the orange u turn egg easy
          player.speedr += 7; //make it easy if they know
        }
    }

    if (player.x > player.maxWidth && player.y < player.maxHeight-300) { //orange check
      player.eggs['orange'] = true; //give orange egg
      player.y = player.maxHeight-110; //reset y height
      player.x = (player.maxWidth/2-5); //reset x height
      player.speedl = 0; //stop you from flying off platform
      player.speedr = 0; //stop you from flying off the platform
    }

    player.collected = 0; //resets counts
    for (let i in player.eggs) { //go through eggs
      if (player.eggs[i]) { //if it collected
        player.collected += 1; //add to the collected count
      }
    }
    if (player.collected > 2) { //if the collected is more than 3
      player.eggs['bronze'] = true; //give the bronze egg
    }
    if (player.collected > 4) { //if the player has 8 or more eggs
      player.eggs['silver'] = true; //give them the silver egg
    }
    if (player.collected > 8) { //if the player has all eggs but gold
      player.eggs['gold'] = true; //give the gold egg
      player.hasWon = true;
    }
  });
  // socket.on('egg', function(egg, recheckval) { //when the player gets an egg
  //   socket.emit('mecheck', recheckval, egg);
  // });
  // socket.on('recheck', function(recheckval, key, egg) {
  //   if ((recheckval/(Math.pow(key, egg.length))) == egg.length) {
  //     var player = players[socket.id] || {}; //grabs the current player variables
  //     player.eggs[egg] = true; //sets the egg collected to true
  //   }
  // });

  socket.on('egg', function(egg) { //when the player gets an egg
    var clayer = players[socket.id] || {}; //grabs the current player variables
    clayer.eggs[egg] = true; //sets the egg collected to true
  });

  socket.on('win', function() {
    var clayer = players[socket.id] || {}; //grabs the current player variables
    for (let i in clayer.eggs) { //go through eggs
      if (clayer.eggs[i] != true) { //if it collected
        clayer.eggs[i] = true; //give every egg you don't have
      }
      clayer.hasWon = true; //make you win
    }
  });

  socket.on('disconnect', function() { //when the player disconnects
    delete players[socket.id]; //remove from the players list so they disappear from the screen
  });
});

let sending = setInterval(sendState, 10); //use the variable sending to set the interval of sendState

function sendState() { //create function sendState() with no parameters
  io.sockets.emit('state', players); //send the message state with the attachment players to all users
  //console.log('sent')
}

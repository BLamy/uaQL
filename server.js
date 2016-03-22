'use strict';

import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import {Schema} from './data/schema';
import socket from 'socket.io';
import http from 'http';

const APP_PORT = 3000;
const GRAPHQL_PORT = 8080;
const SOCKET_PORT = 3001;

// Expose a GraphQL endpoint
var graphQLServer = express();

var socketserver = http.Server(graphQLServer);
var io = socket(socketserver);
//socketserver.listen(SOCKET_PORT);
console.log('env port::', process.env.PORT);

class Room {
  constructor(room : string){
    var number = 0;
    const timer=setInterval((()=>io.to(room).emit('update', {
      room: room, 
      value: number++})), 1000);
    this.destroy = ()=> clearInterval(timer);
  }
}


const rooms = {};
var latestConnection = 0;
const leaveRoom = (socket, room, myRooms, myConnection)=>{
  if(!rooms[room]){
    throw `"${room}" does not exist`;
  }
  if(!myRooms[room]){
    throw `you are not joined to "${room}"`;
  }
  delete myRooms[room];
  delete rooms[room].connections[myConnection];
  if(!--rooms[room].connectionCount){
    rooms[room].room.destroy();
    delete rooms[room];
  }
  socket.leave(room);
};
io.on('connection', (mySocket)=> {
  const myRooms = [];
  const myConnection = latestConnection++;

  mySocket.on('join', (room)=> {
    if(myRooms[room]){
      throw `you are already joined to "${room}"`;
    }
    myRooms[room] = true;
    (rooms[room] || (rooms[room] = {
      room: new Room(room), 
      connectionCount: 0, 
      connections: {}})).connections[myConnection] = true;

    rooms[room].connectionCount++;
    mySocket.join(room);
  });
  mySocket.on('leave', (room) => leaveRoom(mySocket, room, myRooms, myConnection));
  
  mySocket.on('disconnect', function(){
    for(const room of Object.keys(myRooms)) {
      leaveRoom(mySocket, room, myRooms, myConnection);
    }
  });
});







if(false) {

  graphQLServer.use('/', graphQLHTTP({
    graphiql: true,
    pretty: true,
    schema: Schema
  }));


  // Serve the Relay app
  var compiler = webpack({
    entry: path.resolve(__dirname, 'js', 'app.js'),
    module: {
      loaders: [
        {
          exclude: /node_modules/,
          loader: 'babel',
          test: /\.js$/,
        }
      ]
    },
    output: {filename: 'app.js', path: '/'}
  });


  var app = new WebpackDevServer(compiler, {
    contentBase: '/public/',
    proxy: {'graphql': `http://localhost:${GRAPHQL_PORT}`},
    publicPath: '/js/',
    stats: {colors: true}
  });


  // Serve static resources
  app.use('/', express.static(path.resolve(__dirname, 'public')));
  app.listen(APP_PORT, () => {
    console.log(`App is now running on http://localhost:${APP_PORT}`);
  });

} else {

 // Serve the Relay app
  var compiler = webpack({
    entry: path.resolve(__dirname, 'js', 'app.js'),
    module: {
      loaders: [
        {
          exclude: /node_modules/,
          loader: 'babel',
          test: /\.js$/,
        }
      ]
    },
    output: {filename: 'app.js', path: 'build2/js'}
  });
  console.log("running compiler");
  compiler.run((err, stats)=> {
    console.log("compile complete", err, stats);
  });


  graphQLServer.use(express.static('build2'));
  //const io = socket(graphQLServer);

  graphQLServer.use('/', graphQLHTTP({
      graphiql: true,
      pretty: true,
      schema: Schema
  }));

}


socketserver.listen(process.env.PORT || GRAPHQL_PORT, function(){
  console.log('listening on *:' + process.env.PORT || GRAPHQL_PORT);
});

// graphQLServer.listen(process.env.PORT || GRAPHQL_PORT , () => console.log(
//  `GraphQL Server is now running on http://localhost:${process.env.PORT || GRAPHQL_PORT}`
// ));

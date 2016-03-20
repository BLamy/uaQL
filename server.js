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
const GRAPHQL_PORT = 80;
const SOCKET_PORT = 3001;

var socketapp = express();
var socketserver = http.Server(app);
var io = socket(socketserver);
//socketserver.listen(SOCKET_PORT);
console.log('env port::', process.env.PORT);

class Room {
  constructor(room : string){
    var number = 0;
    const timer=setInterval((()=>io.to(room).emit('update', {
      room: room, 
      value: number++})), 0);
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


// Expose a GraphQL endpoint
var graphQLServer = express();
graphQLServer.use('/', graphQLHTTP({
  graphiql: true,
  pretty: true,
  schema: Schema
}));

//const io = socket(graphQLServer);


graphQLServer.listen(process.env.PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));

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
  proxy: {'/graphql': `http://localhost:${GRAPHQL_PORT}`},
  publicPath: '/js/',
  stats: {colors: true}
});


// Serve static resources
app.use('/', express.static(path.resolve(__dirname, 'public')));
//app.listen(APP_PORT, () => {
//  console.log(`App is now running on http://localhost:${APP_PORT}`);
//});


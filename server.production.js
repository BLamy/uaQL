// @flow

'use strict';

import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import {Schema} from './data/schema';
import socket from 'socket.io';
import http from 'http';
import NodeSocket from './NodeSocket';

//import config from './webpack.config';


const APP_PORT = 3000;
const GRAPHQL_PORT = 8080;
const SOCKET_PORT = 3001;

// Expose a GraphQL endpoint
var graphQLServer = express();

var socketserver = new http.Server(graphQLServer);

var io = socket(socketserver, {
  path: '/napi'
});


const rooms = {};
var latestConnection = 0;
const leaveRoom = (socket, nodeId, myRooms, myConnection)=>{
  if(!rooms[nodeId]){
    return;
    throw `"${nodeId}" does not exist`;
  }
  if(!myRooms[nodeId]){
    return;
    throw `you are not joined to "${nodeId}"`;
  }
  delete myRooms[nodeId];
  delete rooms[nodeId].connections[myConnection];
  if(!--rooms[nodeId].connectionCount){
    rooms[nodeId].node.destroy();
    delete rooms[nodeId];
  }
  socket.leave(nodeId);
};

io.on('connection', (mySocket)=> {
  const myRooms = {};
  const myConnection = latestConnection++;

  mySocket.on('join', (nodeId)=> {
    console.log('join:', nodeId)
    if(myRooms[nodeId]){
      return;
    }
    myRooms[nodeId] = true;
    (rooms[nodeId] || (rooms[nodeId] = {
      node: new NodeSocket(nodeId, io), 
      connectionCount: 0, 
      connections: {}})).connections[myConnection] = true;

    mySocket.join(nodeId);
    
    rooms[nodeId].connectionCount++;
    
    if(rooms[nodeId].node.lastValue){
      console.log('sending update...');
      mySocket.emit('update', rooms[nodeId].node.lastValue );
    }

    
  });
  mySocket.on('leave', (nodeId) => {
    console.log('leave:' , nodeId);
    leaveRoom(mySocket, nodeId, myRooms, myConnection);
  });
   
  
  mySocket.on('disconnect', function(){
    console.log('disconnecting...');
    for(const node of Object.keys(myRooms)) {
      try {
        leaveRoom(mySocket, node, myRooms, myConnection);  
      } catch(ex){
        
      }
      
    }
  });
});


const port: number = Number(process.env.PORT); 




  graphQLServer.use('/graphql', graphQLHTTP({
      graphiql: true,
      pretty: true,
      schema: Schema
  }));
  
  graphQLServer.use('/', express.static('build2'));
  graphQLServer.get('/*', function(req, res){
    res.sendFile(__dirname + '/build2/index.html');
  });

  
  const listenPort: number = (port || GRAPHQL_PORT || 8080);
  
  // $FlowIgnore: dunno why this doesn't check...
  socketserver.listen(listenPort, function(){
    console.log('listening on *:' + port || GRAPHQL_PORT || 8080);
  });




// graphQLServer.listen(process.env.PORT || GRAPHQL_PORT , () => console.log(
//  `GraphQL Server is now running on http://localhost:${process.env.PORT || GRAPHQL_PORT}`
// ));

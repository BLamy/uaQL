// @flow

'use strict';

import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import {Schema} from './data/schema';
import socket from 'socket.io';
import http from 'http';
import NodeSocket from './NodeSocket';

//import config from './webpack.config';

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

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
  mySocket.on('leave', (nodeId) => leaveRoom(mySocket, nodeId, myRooms, myConnection));
  
  mySocket.on('disconnect', function(){
    for(const node of Object.keys(myRooms)) {
      leaveRoom(mySocket, node, myRooms, myConnection);
    }
  });
});


const port: number = Number(process.env.PORT); 




if(process.env.NODE_ENV !== 'production') {

  // $FlowIgnore: dunno why this doesn't check...
  socketserver.listen(SOCKET_PORT, function(){
    console.log('socket io on *:' + SOCKET_PORT);
  });
  

  graphQLServer.use('/', graphQLHTTP({
    graphiql: true,
    pretty: true,
    schema: Schema
  }));

  graphQLServer.listen( GRAPHQL_PORT, function(){
    console.log('graphql on *:' + GRAPHQL_PORT);
  });

const app = new WebpackDevServer(webpack(config), {
  contentBase: '/public/',
  proxy: {
    '/graphql': {target: `http://localhost:${GRAPHQL_PORT}`},
    '/napi/*': {
      target: `ws://localhost:${SOCKET_PORT}/napi`,
      ws: true
    }
  },


  publicPath: config.output.publicPath,
  stats: {colors: true},
  hot: true,
  historyApiFallback: true
});

  // Serve static resources
  app.use('/', express.static(path.resolve(__dirname, 'public')));
  app.listen(APP_PORT, () => {
    console.log(`App is now running on http://localhost:${APP_PORT}`);
  });

} else {
/*
 // Serve the Relay app
  var compiler = webpack({
    entry: path.resolve(__dirname, 'js', 'app.js'),
    plugins: [
      new ExtractTextPlugin('example.css', { allChunks: true }),  // compiled css (single file only)
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    })
    ],
    module: {
      loaders: [
        {
          test: /(\.js|\.jsx)$/,
          exclude: /(node_modules)/,
          loaders: ['react-hot', 'babel'],
          //query: {
          //   presets:['es2015','react']
          //}
        }, {
          test: /(\.scss|\.css)$/,
          loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap')
        }
      ]
    },
    postcss: [autoprefixer],
    output: {filename: 'app.js', path: 'build2/js'}
  });
  //console.log("running compiler");
  compiler.run((err, stats)=> {
    console.log("compile complete", err, stats);
  });
*/
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

}



// graphQLServer.listen(process.env.PORT || GRAPHQL_PORT , () => console.log(
//  `GraphQL Server is now running on http://localhost:${process.env.PORT || GRAPHQL_PORT}`
// ));

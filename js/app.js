'use strict';

import 'babel-polyfill';

import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import io from 'socket.io-client';

var socket = io.connect('http://localhost:3001');
socket.on('connect', ()=>{
socket.emit('join', 'room1');
});
socket.on('update', (data)=>document.getElementById('io').innerText =  data.value);

socket.on('news', function (data) {
    alert(JSON.stringify(data));
    socket.emit('my other event', { my: 'data' });
});


ReactDOM.render(
  <Relay.RootContainer
    Component={App}
    route={new AppHomeRoute()}
  />,
  document.getElementById('root')
);




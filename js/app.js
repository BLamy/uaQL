// @flow

'use strict';

import 'babel-polyfill';
import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';
import NoMatch from './components/NoMatch';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import io from 'socket.io-client';
import { RelayRouter } from 'react-router-relay';
import {browserHistory} from 'react-router';
import socketObservable from './data/SocketObservable';
import rx from 'rx';

//var socket = io.connect('/', {path: '/napi/socket.io'});
//socket.on('connect', ()=>{
//	socket.emit('join', 'ns=2;i=10844');
//});
//socket.on('update', (data)=>
//    document.getElementById('io').innerText = data.value);


/*
socketObservable('ns=2;i=10845')
  .subscribe(s=>console.log("we have a socket2....", s));

socketObservable('ns=2;i=10844')
  .subscribe(s=>console.log("we have a socket....", s));

*/

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness  
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const queries = {
    viewer: () => Relay.QL`
      query {
        uaNode(nodeId: $nodeId)
      }
    `,
    server: () => Relay.QL`
      query {
        uaNode('ns=0;i==84')
      }

    `
  };

  ReactDOM.render(
  	 <RelayRouter history={browserHistory}>
  	 	<AppHomeRoute path=':nodeId' component={App} queries={queries}/>
      <Relay.Route path="*" component={NoMatch}/>
  	 </RelayRouter>
    ,
    document.getElementById('root')
  );


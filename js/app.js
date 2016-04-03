// @flow

'use strict';


import 'babel-polyfill';
import App from './components/App';
import NodeMenu from './components/NodeMenu';
import Widget from './components/Widget';
import Value from './components/Value';
import Execute from './components/Execute';
import NoMatch from './components/NoMatch';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import io from 'socket.io-client';
import { RelayRouter } from 'react-router-relay';
import {browserHistory, IndexRoute, DefaultRoute, Route} from 'react-router';
import socketObservable from './data/SocketObservable';
import injectTapEventPlugin from 'react-tap-event-plugin';


import rx from 'rx-lite';


injectTapEventPlugin();


const queries = {
  viewer: () => Relay.QL`
    query {
      uaNode(nodeId: $nodeId)
    }
  `,
  root: () => Relay.QL`
    query {
      uaNode(nodeId: "ns=0;i=84")
    }
  `
};

const widgetqueries = {
  widgetviewer: () => Relay.QL`
    query {
      uaNode(nodeId: $nodeId)
    }
  `,
  root: () => Relay.QL`
    query {
      uaNode(nodeId: "ns=0;i=84")
    }
  `
};
const forwardQueries = {
  widgetviewer: () => Relay.QL`
    query {
      uaNode(nodeId: $nodeId)
    }
  `
};

  ReactDOM.render(
  	 <RelayRouter history={browserHistory}>

  	 	<Route path=':nodeId' component={App} queries={queries}>
        <IndexRoute 
          component={NodeMenu} 
          queries={{viewer: queries.viewer}}
          />
        <Route path='mimic' component={Widget} queries={{widgetviewer: queries.viewer}}/>
        <Route path='value' component={Value} queries={{widgetviewer: queries.viewer}}/>
        <Route path='execute' component={Execute} queries={forwardQueries}/>
      </Route>

        
      <Route path="*" component={NoMatch}/>
  	 </RelayRouter>
    ,
    document.getElementById('root')
  );


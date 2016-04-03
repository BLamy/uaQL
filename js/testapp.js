// @flow

'use strict';


import 'babel-polyfill';
import Test from './test/Test';
import TestNodeClass from './test/TestNodeClass';

import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import { RelayRouter } from 'react-router-relay';
import {browserHistory} from 'react-router';


const queries = {
  viewer: () => Relay.QL`
    query {
      uaNode(nodeId: $nodeId)
    }
  `
};

const queries2 = {
  viewer: () => Relay.QL`
    query {
      uaNode(nodeId: $nodeId)
    }
  `
};

  ReactDOM.render(
  	 <RelayRouter history={browserHistory}>
  	 	<Relay.Route path=':nodeId' component={Test} queries={queries}>
        <Relay.Route path='nodeclass' component={TestNodeClass} queries={queries2}/>
      </Relay.Route>
     </RelayRouter>
    ,
    document.getElementById('root')
  );


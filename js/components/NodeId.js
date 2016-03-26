// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';

import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';


const NodeId = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on ExpandedNodeId {  
            identifierType
            value
            namespace
          }
        `
      }
    }
  )
)(({viewer})=>
  <span>
    {viewer.namespace}
    {viewer.identifierType}
    {viewer.value}
  </span>
);

export default NodeId;
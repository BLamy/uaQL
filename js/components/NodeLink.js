// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import NodeName from './NodeName';

import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';

const getId=(id)=> {
  if(id==='STRING') return 's';
  if(id==='BYTESTRING') return 'b';
  if(id==='NUMERIC') return 'i';
  if(id==='GUID') return 'g';
  return id;
}


const NodeLink = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            ${NodeName.getFragment('viewer')}
            nodeClass
            nodeId {
              namespace
              identifierType
              value
            }
          }
        `
      }
    }
  )
)(({viewer})=>
  <span>
    <Link to={'/ns=' 
      + viewer.nodeId.namespace 
      + ';' 
      + getId(viewer.nodeId.identifierType)
      + '=' + viewer.nodeId.value}>
       
      <NodeName viewer={viewer}/>
    </Link>
    (
      {viewer.nodeClass}
    )
  </span>
);


export default NodeLink;


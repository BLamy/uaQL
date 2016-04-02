// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import NodeName from './NodeName';

import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import FlatButton from 'material-ui/lib/flat-button';

const getId=(id)=> {
  if(id==='STRING') return 's';
  if(id==='BYTESTRING') return 'b';
  if(id==='NUMERIC') return 'i';
  if(id==='GUID') return 'g';
  return id;
}


const NodeLink = compose(

)(({viewer})=>

<FlatButton
  containerElement={
    <Link to={'/ns=' 
      + viewer.uaNode.nodeId.namespace 
      + ';' 
      + getId(viewer.uaNode.nodeId.identifierType)
      + '=' + viewer.uaNode.nodeId.value}/>}
  label={viewer.referenceTypeId.uaNode.displayName.text + ':' +viewer.uaNode.displayName.text}/>


    
  
);


export default NodeLink;


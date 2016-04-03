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

const space =  (string) => string.replace(/([A-Z])/g, ' $1');

const NodeLink = compose(

)(({viewer})=>

<FlatButton
  containerElement={
    <Link  title={viewer.referenceTypeId.uaNode.displayName.text} to={'/ns=' 
      + viewer.uaNode.nodeId.namespace 
      + ';' 
      + getId(viewer.uaNode.nodeId.identifierType)
      + '=' + viewer.uaNode.nodeId.value}/>}
  label={space(viewer.uaNode.displayName.text)}/>


    
  
);


export default NodeLink;


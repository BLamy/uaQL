// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import NodeName from './NodeName';

const getId=(id)=> {
  if(id==='STRING') return 's';
  if(id==='BYTESTRING') return 'b';
  if(id==='NUMERIC') return 'i';
  if(id==='GUID') return 'g';
  return id;
}

class NodeLink extends React.Component {
  
  render() {
    return (
      <span>
    	<Link to={'/ns=' 
          + this.props.viewer.nodeId.namespace 
          + ';' 
          + getId(this.props.viewer.nodeId.identifierType)
          + '=' + this.props.viewer.nodeId.value}>
           
          <NodeName viewer={this.props.viewer}/>
        </Link>
        (
          {this.props.viewer.nodeClass}
        )
      </span>
  	);
  }
 }


export default Relay.createContainer(NodeLink, {
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
  });

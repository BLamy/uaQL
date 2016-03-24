'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import NodeName from './NodeName';
import NodeClassEnum from './NodeClassEnum';

const getId=(id)=> {
  if(id==='STRING') return 's';
  if(id==='BYTESTRING') return 'b';
  if(id==='NUMERIC') return 'i';
  if(id==='GUID') return 'g';
  return id;
}

class App extends React.Component {
  
  render() {
    return (
      <span>
    	<Link to={'/ns=' 
          + this.props.viewer.nodeId.value.value.namespace 
          + ';' 
          + getId(this.props.viewer.nodeId.value.value.identifierType)
          + '=' + this.props.viewer.nodeId.value.value.value}>
           
          <NodeName viewer={this.props.viewer}/>
        </Link>
        (
          <NodeClassEnum viewer = {this.props.viewer.nodeClassEnum}/>
        )
      </span>
  	);
  }
 }


export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on UANode {
        ${NodeName.getFragment('viewer')}
        nodeClassEnum {
            ${NodeClassEnum.getFragment('viewer')}
          }
        nodeId {
            value {
              value {
                value
                namespace
                identifierType
              }
            }
          }
      }
     `
    }
  });

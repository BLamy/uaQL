'use strict';

import React from 'react';
import Relay from 'react-relay';

class NodeId extends React.Component { 
  render() {
    return (
    	<span>
        {this.props.viewer.namespace}
        {this.props.viewer.identifierType}
        {this.props.viewer.value}
      </span>
  	);
  }
 }


export default Relay.createContainer(NodeId, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on ExpandedNodeId {  
        identifierType
        value
        namespace
      }
     `
    }
  });

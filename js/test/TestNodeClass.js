// @flow

'use strict';


import React from 'react';
import Relay from 'react-relay';


class TestNodeClass extends React.Component {
  
  render() {
    console.log('no test node class');
    return (
      <div>
        <h2>{this.props.viewer.nodeClass}</h2>
        
              
      </div>
    );
  }
}


export default Relay.createContainer(TestNodeClass, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on UANode {
        nodeClass
      }
    `
  }
})


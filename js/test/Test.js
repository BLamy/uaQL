// @flow

'use strict';


import React from 'react';
import Relay from 'react-relay';


class App extends React.Component {
  
  render() {

    return (
      <div>
      hello!
        <h1>{this.props.viewer.id}</h1>
        {this.props.children} 
      </div>
    );
  }
}


export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on UANode {
        id
        nodeClass
      }
    `
  }
})


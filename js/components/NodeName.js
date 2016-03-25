// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';

class NodeName extends React.Component {
  
  render() {
    return (

      <LocalizedText viewer={this.props.viewer.displayName}/>
  	);
  }
 }


export default Relay.createContainer(NodeName, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on UANode {
        displayName {
          ${LocalizedText.getFragment('viewer')}
        }
      }
     `
    }
  });

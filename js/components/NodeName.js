'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';

class App extends React.Component {
  
  render() {
    return (
      <LocalizedText viewer={this.props.viewer.displayName}/>
  	);
  }
 }


export default Relay.createContainer(App, {
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

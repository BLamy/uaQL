'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';

class LocalizedText extends React.Component {
  
  render() {
    return (
    	<span>
        {this.props.viewer ? this.props.viewer.text : undefined}
      </span>
  	);
  }
 }


export default Relay.createContainer(LocalizedText, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on LocalizedText {  
        text
      }
     `
    }
  });

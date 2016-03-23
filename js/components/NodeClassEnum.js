'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';

class App extends React.Component {
  
  render() {
    return (
    	<span>
    		{this.props.viewer.value.value}
        </span>
  	);
  }
 }


export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on NodeClassEnumValueResult {  
        value {
          value
        }
      }
     `
    }
  });
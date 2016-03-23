'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import ReferenceLink from './ReferenceLink';

class App extends React.Component {
  
  render() {
    return (
    	<div>
	    	<ul>
	    	{this.props.viewer.backReferences.edges.map((r,i) =>
	    		<li key = {r.node.id}>
	    			<ReferenceLink viewer={r.node}/>
	    		</li>
	    	)}
	    	</ul>
  			
  		</div>
  	);
  }
 }


export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on UANode {
        nodeClass {
        	stringValue
        }
        displayName {
        	value {
        		value {
        			text
        		}
        	}
        }
        browseName {
        	value {
        		value {
        			name
        		}
        	}
        }
        
		backReferences: references(first:10 browseDirection: Inverse) {
          edges {
            node {
              id
              ${ReferenceLink.getFragment('viewer')}
          	}
          }
        }


       }
     `
    }
  });

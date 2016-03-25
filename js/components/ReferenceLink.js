'use strict';
// @flow

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import NodeLink from './NodeLink';

class ReferenceLink extends React.Component {
  
  render() {
    return (
      <span>
        <NodeLink viewer= {this.props.viewer.referenceTypeId.uaNode}/>
        -
        <NodeLink viewer= {this.props.viewer.uaNode}/>
      </span>
  	);
  }
 }


export default Relay.createContainer(ReferenceLink, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on ReferenceDescription {
        uaNode {
          id
          ${NodeLink.getFragment('viewer')}
        }
        referenceTypeId {
          uaNode {
            ${NodeLink.getFragment('viewer')}
          }
        }
      }
     `
    }
  });

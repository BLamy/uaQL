'use strict';
// @flow

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import NodeLink from './NodeLink';
import {createContainer} from 'recompose-relay';
import {compose,} from 'recompose';

const ReferenceLink = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on ReferenceDescription {
            uaNode {
              id
              ${NodeLink.getFragment('viewer')}
            }
            browseName {
              name
              namespaceIndex
            }
            referenceTypeId {
              uaNode {
                ${NodeLink.getFragment('viewer')}
              }
            }
          }
         `
        }
    }
  )
)(({viewer})=>
  <span>
    <NodeLink viewer= {viewer.referenceTypeId.uaNode}/>
    + {viewer.browseName.namespaceIndex} : {viewer.browseName.name}+
    -
    <NodeLink viewer= {viewer.uaNode}/>
  </span>
);

export default ReferenceLink;

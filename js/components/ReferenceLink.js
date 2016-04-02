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
              nodeClass
              nodeId {
                namespace
                identifierType
                value
              }
              displayName {
                text
              }
            }
            referenceTypeId {
              uaNode {
                displayName {
                  text
                }
              }  
            }
          }
         `
        }
    }
  )
)(({viewer})=>
    viewer
      ? <NodeLink viewer= {viewer}/>
      : undefined
    
    
);
//<NodeLink viewer= {viewer.referenceTypeId.uaNode}/>
export default ReferenceLink;

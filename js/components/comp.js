// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import ReferenceLink from './ReferenceLink';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';


const Comp = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
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
    }
  )
)(({viewer})=> 
  <ul>
    {viewer.backReferences.edges.map((r,i) =>
      <li key = {r.node.id}>
        <ReferenceLink viewer={r.node}/>
      </li>
    )}
  </ul>
);

export default Comp;

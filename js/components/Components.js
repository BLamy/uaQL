// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import Component from './Component';

const Components = (MyComponent) => compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            ${MyComponent.getFragment('viewer')}
            components: references(first:1000 referenceTypeId: "ns=0;i=47") {
              edges {
                node {
                  id
                  displayName {
                    text
                  }
                  uaNode {
                    id
                    ${MyComponent.getFragment('viewer')}
                  }
                }
              }
            }
          }
        `
      }
    }
  )
)(({viewer, root})=>
  <div> 
    <ul>
      <MyComponent viewer={viewer}/>
      {viewer.components.edges.map(n=> 
        <li key={n.node.id}>
          {n.node.uaNode
            ? <MyComponent viewer={n.node.uaNode}/>
            : 'nothing'
          }
        </li>
      )}
    </ul>
  </div>
);


export default Components;

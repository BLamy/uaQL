// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import Component from './Component';

const Components = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
              components: references(first:1000 referenceTypeId: "ns=0;i=47") {
                edges {
                  node {
                    id
                    displayName {
                      text
                    }
                    uaNode {
                      ${Component.getFragment('viewer')}
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
      {viewer.components.edges.map(n=> 
        <li key={n.node.id}> mmm
          {n.node.uaNode
            ? <Component viewer={n.node.uaNode}/>
            : undefined
          }
        </li>
      )}
    </ul>
  </div>
);


export default Components;

// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import {Link} from 'react-router';







const Links = compose(

  createContainer(
    {
      fragments: {
        root: ()=> Relay.QL`
          fragment on UANode {
            serverNamespaces: browsePath(paths:["Objects", "Server", "NamespaceArray"]) {
              dataValue { 
                ... on UaStringArray {value}
              }
            } 
          }
        `,
        viewer: () => Relay.QL`
          fragment on UANode {
            references(first: 1000, referenceTypeId: "ns=0;i=40") {
              edges {
                node {
                  id
                  browseName {
                    namespaceIndex
                    name
                  }
                  uaNode {
                    displayName {
                      text
                    }                    
                  }
                }
              }
            }
          }
        `
      }
    }
  )

)(({viewer, root, path})=>
  <div>
    <ul>
      {viewer.references.edges
        .map(e=>e.node)
        .map(node=>
          <li key={node.id}>
            <Link to = {`${path}/mimic`}>
              {node.uaNode.displayName.text}
              {root.serverNamespaces.dataValue.value[node.browseName.namespaceIndex]}
            </Link>
          </li>
        )
      }
    </ul>
  </div>
);


export default Links;

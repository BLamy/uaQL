// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import DataValue from './DataValue';







const Pipe = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
              id
              ftx001: browsePath(paths: ["FTX001:4"], types:["ns=0;i=47"]) {
                displayName {
                  text
                }
                output: browsePath(paths: ["Output:4"], types:["ns=0;i=47"]) {
                  displayName {
                    text
                  }
                  ${DataValue.getFragment('viewer')}
                }
              }
              components: references(first:1000 referenceTypeId: "ns=0;i=47") {
                edges {
                  node {
                    id
                    displayName {
                      text
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
  {viewer.ftx001.output.displayName.text}
  <DataValue viewer={viewer.ftx001.output}/>
  <ul>
     {viewer.components.edges.map(n=> 
        <li key={n.node.id}>{n.node.displayName.text}</li>
      )}
    </ul>
  </div>
);


export default Pipe;

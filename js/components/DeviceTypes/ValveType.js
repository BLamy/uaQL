// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from '../DataValue';







const ValveType = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            input: browsePath(paths: ["Input:4"], types:["ns=0;i=47"]) {
              displayName {
                text
              }
              ${DataValue.getFragment('viewer')}
            }
          }
        `
      }
    }
  )
)(({viewer, root})=>
  <div> {viewer.input 
    ? <div> VAlve!!
        {viewer.input.displayName.text}
        <DataValue viewer={viewer.input}/>
      </div>
    : undefined}
  
  </div>
);


export default ValveType;

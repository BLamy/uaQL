// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from '../DataValue';

const LevelIndicatorType = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            output: browsePath(paths: ["Output:4"], types:["ns=0;i=47"]) {
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
  <div> {viewer.output 
    ? <div> LI!!
        {viewer.output.displayName.text}
        <DataValue viewer={viewer.output}/>
      </div>
    : undefined}
  
  </div>
);


export default LevelIndicatorType;

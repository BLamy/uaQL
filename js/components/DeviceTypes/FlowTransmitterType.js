// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from '../DataValue';
import FlowMeter from '../svg/FlowMeter';
import observeMultiProps from '../util/observeMultiProps';

const composer = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            output: browsePath(paths: ["Output:4"], types:["ns=0;i=47"]) {
              displayName {
                text
              }
              nodeId {
                namespace,
                value
              }
              dataValue {
                ... on IUaDataValue {
                  ... on UaFloat {
                    value
                  }
                }
              }
              
              ${DataValue.getFragment('viewer')}
            }
          }
        `
      }
    }
  ),
  observeMultiProps(['output'])
)

const FlowTransmitterType = composer(({viewer, output})=> 
<svg>
  <FlowMeter value={output ? output.value : undefined}/>
</svg>);

const Svg = composer(({output})=> <FlowMeter value={output ? output.value : undefined}/>);

export { FlowTransmitterType as default, Svg};

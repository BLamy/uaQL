// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import {Observable} from 'rx-lite';
import {observeProps} from 'rx-recompose';
import DataValue from '../DataValue';
import FlowMeter from '../svg/FlowMeter';
import observeMultiProps from '../util/observeMultiProps';


const composer = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            currentState: browsePath(paths: ["CurrentState:0"], types:["ns=0;i=47"]) {
              nodeId {
                namespace,
                value
              }
              dataValue {
                __typename
                ... on IUaDataValue {
                  ... on UaLocalizedText {
                    value {
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
  ),
  observeMultiProps([
    {
      name: 'currentState',
      attributeId: 'Value',
      property: 'currentState'
    }
  ])


);


const SimulationType = composer(({viewer, value})=>
  <div> 
    {viewer.currentState 
    ? <div>
        {value && value.value ? value.value.text : null}
      </div>
    : undefined}
  </div>
);

const Svg = composer(({viewer, currentState})=>
  <g>
    {currentState && currentState.value 
      ? <text x="20" y="20" fontSize="20pt">{currentState.value.value.value.text}</text>
      : null
    }

  </g>
);

export {SimulationType as default, Svg};

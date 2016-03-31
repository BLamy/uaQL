// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from '../DataValue';
import observeMultiProps from '../util/observeMultiProps';
import FlowController from '../svg/FlowController';


const composer = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            measurement: browsePath(paths: ["Measurement:4"], types:["ns=0;i=46"]) {
              displayName {
                text
              }
              nodeId {
                namespace,
                value
              }
              ${DataValue.getFragment('viewer')}
            }
            setPoint: browsePath(paths: ["SetPoint:4"], types:["ns=0;i=46"]) {
              displayName {
                text
              }
              nodeId {
                namespace,
                value
              }
              ${DataValue.getFragment('viewer')}
            }
            controlOut: browsePath(paths: ["ControlOut:4"], types:["ns=0;i=46"]) {
              displayName {
                text
              }
              nodeId {
                namespace,
                value
              }
              ${DataValue.getFragment('viewer')}
            }
          }
        `
      }
    }
  ),
  observeMultiProps(['measurement', 'setPoint', 'controlOut'])

);

const FlowControllerType = composer(({viewer, measurement, setPoint, controlOut})=>
  <svg height={200}>
    <g transform="scale(3)">
      <FlowController measurement={measurement ? measurement.value : undefined} setPoint={setPoint ? setPoint.value : undefined} controlOut={controlOut ? controlOut.value : undefined}/>
    </g>
  </svg>
);


const Svg = composer(({measurement, setPoint, controlOut})=>
  <FlowController 
    measurement={measurement ? measurement.value : undefined} 
    setPoint={setPoint ? setPoint.value : undefined} 
    controlOut={controlOut ? controlOut.value : undefined}
  />);



export {FlowControllerType as default, Svg};

// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from '../DataValue';


const FlowControllerType = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            measurement: browsePath(paths: ["Measurement:4"], types:["ns=0;i=46"]) {
              displayName {
                text
              }
              ${DataValue.getFragment('viewer')}
            }
            setPoint: browsePath(paths: ["SetPoint:4"], types:["ns=0;i=46"]) {
              displayName {
                text
              }
              ${DataValue.getFragment('viewer')}
            }
            controlOut: browsePath(paths: ["ControlOut:4"], types:["ns=0;i=46"]) {
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
  <div> {viewer.measurement 
    ? <div> FC!!
        <DataValue viewer={viewer.measurement}/>
        <DataValue viewer={viewer.setPoint}/>
        <DataValue viewer={viewer.controlOut}/>
      </div>
    : undefined}
  
  </div>
);


export default FlowControllerType;

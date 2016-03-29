// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import {Observable} from 'rx';
import {observeProps} from 'rx-recompose';
import DataValue from '../DataValue';
import FlowMeter from '../svg/FlowMeter';
import socketObservable from '../../data/SocketObservable'


const SimulationType = compose(

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
  observeProps(props$=>{
      const viewer = props$.map(p=>p.viewer)
      return {
        viewer,
        value:viewer.map(v=>{
            if(v.currentState) {
              return socketObservable(`ns=${v.currentState.nodeId.namespace};i=${v.currentState.nodeId.value}`);
            } else {
              return Observable.return();
            }
          })
          .switch()
      };
    }
  )


)(({viewer, value})=>
  <div> {viewer.currentState 
    ? <div>
        {value && value.value ? value.value.text : null}
      </div>
    : undefined}
  
  </div>
);


export default SimulationType;

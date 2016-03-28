// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import FlowTransmitter from './DeviceTypes/FlowTransmitterType';
import Valve from './DeviceTypes/ValveType';

const Component = compose(

  createContainer(
    {
      initialVariables: {
        'ftx': false,
        'valve': false,
      },
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            id
            ftx: self @include(if: $ftx)  {
              ${FlowTransmitter.getFragment('viewer')}  
            }
            valve: self @include(if: $valve)  {
              ${Valve.getFragment('viewer')}  
            }
            references(first:1000 referenceTypeId:"ns=0;i=40"){
              edges {
                node {
                  browseName {
                    name
                  }
                }
              }
            }
          }
        `
      }
    }
  ),
  doOnReceiveProps(({relay, viewer})=>{
    relay.setVariables({
      'ftx': viewer.references.edges[0].node.browseName.name === "FlowTransmitterType",
      'valve': viewer.references.edges[0].node.browseName.name === "ValveType"
    });
  })
)(({viewer})=>
  <div> 
    {viewer.ftx
      ? <FlowTransmitter viewer={viewer.ftx}></FlowTransmitter>
      : undefined 
    }
    {viewer.valve
      ? <Valve viewer={viewer.valve}></Valve>
      : undefined 
    }
  </div>
);


export default Component;

// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import FlowTransmitter from './DeviceTypes/FlowTransmitterType';
import FlowController from './DeviceTypes/FlowControllerType';
import LevelIndicator from './DeviceTypes/LevelIndicatorType';
import Valve from './DeviceTypes/ValveType';

const Component = compose(

  createContainer(
    {
      initialVariables: {
        'ftx': false,
        'valve': false,
        'li': false,
        'fc': false
      },
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            id
            ftx: self @include(if: $ftx)  {
              ${FlowTransmitter.getFragment('viewer')}  
            }
            fc: self @include(if: $fc)  {
              ${FlowController.getFragment('viewer')}  
            }
            valve: self @include(if: $valve)  {
              ${Valve.getFragment('viewer')}  
            }
            li: self @include(if: $li)  {
              ${LevelIndicator.getFragment('viewer')}  
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
    console.log('fc:::', viewer.references.edges[0].node.browseName.name === "FlowControllerType");
    relay.setVariables({
      'ftx': viewer.references.edges[0].node.browseName.name === "FlowTransmitterType",
      'fc': viewer.references.edges[0].node.browseName.name === "FlowControllerType",
      'valve': viewer.references.edges[0].node.browseName.name === "ValveType",
      'li': viewer.references.edges[0].node.browseName.name === "LevelIndicatorType"
    });
  })
)(({viewer})=>
  <div> 
    {viewer.ftx
      ? <FlowTransmitter viewer={viewer.ftx}/>
      : undefined 
    }
    {viewer.fc
      ? <FlowController viewer={viewer.fc}/>
      : undefined 
    }
    {viewer.valve
      ? <Valve viewer={viewer.valve}/>
      : undefined 
    }
    {viewer.li
      ? <LevelIndicator viewer={viewer.li}/>
      : undefined 
    }
    
  </div>
);


export default Component;

// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import {Svg as FlowTransmitter}  from './DeviceTypes/FlowTransmitterType';
import {Svg as FlowController} from './DeviceTypes/FlowControllerType';
import LevelIndicator from './DeviceTypes/LevelIndicatorType';
import Valve from './DeviceTypes/ValveType';
import Method from './DeviceTypes/MethodType';
import Simulation from './DeviceTypes/SimulationType';

const Component = compose(

  createContainer(
    {
      initialVariables: {
        'ftx': false,
        'valve': false,
        'li': false,
        'fc': false,
        'method': false,
        'simulation': false
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
            method: self @include(if: $method)  {
              ${Method.getFragment('viewer')}  
            }
            simulation: self @include(if: $simulation)  {
              ${Simulation.getFragment('viewer')}  
            }
            
            references(first:1000 referenceTypeId:"ns=0;i=40"){
              edges {
                node {
                  browseName {
                    name
                  }
                  uaNode {
                    nodeClass
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
      'fc': viewer.references.edges[0].node.browseName.name === "FlowControllerType",
      'valve': viewer.references.edges[0].node.browseName.name === "ValveType",
      'li': viewer.references.edges[0].node.browseName.name === "LevelIndicatorType",
      'method': viewer.references.edges[0].node.uaNode.nodeClass === "Method",
      'simulation': viewer.references.edges[0].node.browseName.name === "BoilerStateMachineType" 
    });
  })
)(({viewer})=>
  <div>

    {viewer.ftx
      ? <svg>
          <FlowTransmitter viewer={viewer.ftx}/>
        </svg>
      : undefined 
    }
    {viewer.fc
      ? <svg>
          <FlowController viewer={viewer.fc}/>
        </svg>
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
    {viewer.method
      ? <Method viewer={viewer.method}/>
      : undefined 
    }
    {viewer.simulation
      ? <Simulation viewer={viewer.simulation}/>
      : undefined 
    }
    
  </div>
);


export default Component;

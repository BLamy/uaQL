// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import {Svg as FlowTransmitter}  from './DeviceTypes/FlowTransmitterType';
import {Svg as FlowController} from './DeviceTypes/FlowControllerType';
import {Svg as LevelController} from './DeviceTypes/LevelControllerType';
import {Svg as LevelIndicator} from './DeviceTypes/LevelIndicatorType';
import {Svg as Valve} from './DeviceTypes/ValveType';
import {Svg as Method} from './DeviceTypes/MethodType';
import {Svg as Simulation} from './DeviceTypes/SimulationType';

const Component = compose(

  createContainer(
    {
      initialVariables: {
        'ftx': false,
        'valve': false,
        'li': false,
        'fc': false,
        'lc': false,
        'method': false,
        'simulation': false,
        'components': false
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
            lc: self @include(if: $lc)  {
              ${LevelController.getFragment('viewer')}  
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
            components: self @include(if: $components)  {
              references(first:1000 referenceTypeId: "ns=0;i=47") {
                edges {
                  node {
                    id
                    displayName {
                      text
                    }
                    uaNode {
                      id
                      ${Component.getFragment('viewer')}
                    }
                  }
                }
              }
            }
            organises: self @include(if: $components)  {
              references(first:1000 referenceTypeId: "ns=0;i=35") {
                edges {
                  node {
                    id
                    displayName {
                      text
                    }
                    uaNode {
                      id
                      ${Component.getFragment('viewer')}
                    }
                  }
                }
              }
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
      'lc': viewer.references.edges[0].node.browseName.name === "LevelControllerType",
      'method': viewer.references.edges[0].node.uaNode.nodeClass === "Method",
      'simulation': viewer.references.edges[0].node.browseName.name === "BoilerStateMachineType",
      'components': true
    });
  })
)(({viewer})=> {
    if(viewer.ftx) { 
      return <FlowTransmitter viewer={viewer.ftx}/>;
    }
        
    if(viewer.fc) {
      return <FlowController viewer={viewer.fc}/>; 
    }
    if(viewer.valve) {
      return <Valve viewer={viewer.valve}/>; 
    }
    if(viewer.lc) {
      return <LevelController viewer={viewer.lc}/>; 
    }
    if(viewer.li) {
      return <LevelIndicator viewer={viewer.li}/>
    }
    if(viewer.method) {
      return  <Method viewer={viewer.method}/>;
    }
    if(viewer.simulation) {
      return <Simulation viewer={viewer.simulation}/>; 
    }

    if(viewer.components) {

      return <g> 
        {viewer.components.references.edges.map(n=> 
          <g key={n.node.id}>
            {n.node.uaNode
              ? <Component viewer={n.node.uaNode}/>
              : null
            }
          </g>
        )}
        {viewer.organises.references.edges.map(n=> 
          <g key={n.node.id}>
            {n.node.uaNode
              ? <Component viewer={n.node.uaNode}/>
              : null
            }
          </g>
        )}
      </g>
    }
    return <g/>

});


export default Component;

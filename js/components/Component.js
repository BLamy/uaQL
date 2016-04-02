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
import Tank from './svg/Tank';

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
            myRefs : self @include(if: $components) {
              references(first:1000 referenceTypeId:"ns=0;i=40") {
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
          }
        `
      }
    }
  ),
  doOnReceiveProps(({relay, viewer})=>{
    if(viewer.myRefs && viewer.myRefs.references.edges[0]) {
      relay.setVariables({
        'ftx': viewer.myRefs.references.edges[0].node.browseName.name === "FlowTransmitterType",
        'fc': viewer.myRefs.references.edges[0].node.browseName.name === "FlowControllerType",
        'valve': viewer.myRefs.references.edges[0].node.browseName.name === "ValveType",
        'li': viewer.myRefs.references.edges[0].node.browseName.name === "LevelIndicatorType",
        'lc': viewer.myRefs.references.edges[0].node.browseName.name === "LevelControllerType",
        'method': viewer.myRefs.references.edges[0].node.uaNode.nodeClass === "Method",
        'simulation': viewer.myRefs.references.edges[0].node.browseName.name === "BoilerStateMachineType",
        'components': true
      });

    } else {
      relay.setVariables({
         'components': true
      });      
    }
  })
)(({viewer})=> {

    var component = null;

    if(viewer.ftx) { 
      component = <FlowTransmitter viewer={viewer.ftx}/>;
    }
        
    if(viewer.fc) {
      component =  <FlowController viewer={viewer.fc}/>; 
    }
    if(viewer.valve) {
      component = <Valve viewer={viewer.valve}/>; 
    }
    if(viewer.lc) {
      component =  <LevelController viewer={viewer.lc}/>; 
    }
    if(viewer.li) {
      component =  <LevelIndicator viewer={viewer.li}/>
    }
    if(viewer.method) {
      component =   <Method viewer={viewer.method}/>;
    }
    if(viewer.simulation) {
      component =  <Simulation viewer={viewer.simulation}/>; 
    }
    if(viewer.myRefs && viewer.myRefs.references.edges[0] && viewer.myRefs.references.edges[0].node.browseName.name === "BoilerType") {
      component = <Tank/>;
    }
    if(viewer.components) {
      component = <g> 
        {component}
        {viewer.components.references.edges.map((n, i)=> 
          <g key={n.node.id} transform={`translate(${(i%2)*150}, ${Math.floor(i/2)*150})`}>
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
    return component || <g/>;

});


export default Component;

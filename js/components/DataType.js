// @flow

import React from 'react';
import Relay from 'react-relay';
import VariableBase from './VariableBase';
import NodeName from './NodeName';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';


const DataType = compose(
  createContainer(
    {
      initialVariables: {
        'nodeClassIsVariable': undefined
      },
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {  
            nodeClass
            dataType  @include(if: $nodeClassIsVariable) {
              uaNode {
                ${NodeName.getFragment('viewer')}
              }
            }
          }
         `
        }
      }
    ),
    VariableBase
  )(({viewer})=>
    <span>
        {viewer.dataType
          ? <h2 title='dataType'>
              <NodeName viewer={viewer.dataType.uaNode}/>
            </h2>
          : undefined
        }
      </span>
    );

export default DataType;

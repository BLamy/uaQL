// @flow

import React from 'react';
import Relay from 'react-relay';
import VariableBase from './VariableBase';
import {createContainer} from 'recompose-relay';
import {compose,} from 'recompose';


const Monitor = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {  
            nodeId {
              identifierType
              value
              namespace
            }
            nodeClass
          }
         `
        }
      }
    )
    )(({viewer, value})=>
      undefined
    );

export default Monitor;

// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from '../DataValue';


const MethodType = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            id
            displayName {
              text
            }
          }
        `
      }
    }
  )
)(({viewer, root})=>
  <div> METHOD!! {viewer.displayName.text}
  
  </div>
);


export default MethodType;

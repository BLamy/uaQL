// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from './DataValue';


import Component from './Component';
import Components from './Components';
const MyComponents = Components(Component);



const Pipe = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            id
            displayName {
              text
            }
            ${MyComponents.getFragment('viewer')}
          }
        `
      }
    }
  ),
)(({viewer, root})=>
  <div>  
    <div>
      {viewer.displayName.text}
    </div>
      <svg height={200} style={{background: 'pink'}}>
        <MyComponents viewer={viewer}/>
      </svg>
  </div>
);


export default Pipe;

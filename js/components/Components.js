// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
//import Component from './Component';

const Components = (MyComponent) => compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            ${MyComponent.getFragment('viewer')}
          }
        `
      }
    }
  )
)(({viewer, root})=> {
  return <g>
    <MyComponent viewer={viewer}/>
    
  </g>
}
  
);


export default Components;

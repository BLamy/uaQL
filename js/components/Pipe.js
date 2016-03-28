// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from './DataValue';



import Components from './Components';




const Pipe = compose(

  createContainer(
    {
      initialVariables: {
        'ftx001': undefined,
        'go': false
      },
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
              id
              ftx001: browsePath(paths: [$ftx001], types:["ns=0;i=47"]) 
                @include(if: $go) {
                  displayName {
                    text
                  }
                  output: browsePath(paths: ["Output:4"], types:["ns=0;i=47"]) {
                    displayName {
                      text
                    }
                    ${DataValue.getFragment('viewer')}
                  }
                }
              ${Components.getFragment('viewer')}
          }
        `
      }
    }
  ),
  doOnReceiveProps((props)=>{
    props.relay.setVariables({
      'go' : true,
      'ftx001': `FTX${props.deviceId}:4` // props.viewer.nodeClass ==='Variable'
    });
  })

)(({viewer, root})=>
  <div> {viewer.ftx001 
    ? <div>
        {viewer.ftx001.output.displayName.text}
        <DataValue viewer={viewer.ftx001.output}/>
      </div>
    : undefined}
    <Components viewer={viewer}/>
  </div>
);


export default Pipe;

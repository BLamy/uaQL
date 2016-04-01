// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import Valve from '../svg/Valve';
import observeMultiProps from '../util/observeMultiProps';







const composer = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            input: browsePath(paths: ["Input:4"], types:["ns=0;i=47"]) {
              displayName {
                text
              }
              nodeId {
                identifierType
                value
                namespace
              }
              
            }
          }
        `
      }
    }
  ),
  observeMultiProps(['input'])
);



const ValveType = composer(({viewer, input})=>
  <div> {viewer.input 
    ? <div> VAlve!!
        {viewer.input.displayName.text}
        <DataValue viewer={viewer.input}/>
      </div>
    : undefined}
  </div>
);

const Svg = composer(({input})=><Valve value={input ? input.value: null}/>);

export {ValveType as default, Svg};

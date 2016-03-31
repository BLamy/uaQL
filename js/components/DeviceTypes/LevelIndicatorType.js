// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from '../DataValue';
import observeMultiProps from '../util/observeMultiProps';
import Level from '../svg/Level';


const composer = compose(

  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            output: browsePath(paths: ["Output:4"], types:["ns=0;i=47"]) {
              displayName {
                text
              }
              nodeId {
                namespace,
                value
              }
              ${DataValue.getFragment('viewer')}
            }
          }
        `
      }
    }
  ),
  observeMultiProps(['output'])
);


const LevelIndicatorType = composer
  (({viewer, output})=>
          <svg height={200}>
            <g transform="scale(1)">
              <Level value={output ? output.value : null}/>
            </g>
          </svg>
      );

const Svg = composer
  (({output})=>
    <Level value={output ? output.value : null}/>
  );

export {LevelIndicatorType as default, Svg};

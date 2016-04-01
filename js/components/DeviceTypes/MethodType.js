// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';
import DataValue from '../DataValue';


const composer = compose(

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
);

const MethodType = composer
  (({viewer})=>
    <div> METHOD!! {viewer.displayName.text}
    
    </div>
  );
const Svg = composer(()=><g/>);

export {MethodType as default, Svg};

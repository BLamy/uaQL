// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';


const NodeName = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            displayName {
              ${LocalizedText.getFragment('viewer')}
            }
          }
        `
      }
    }
  )
)(({viewer})=>
  <LocalizedText viewer={viewer.displayName}/>
);


export default NodeName;

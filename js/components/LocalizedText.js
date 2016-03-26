// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';


import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';


const LocalizedText = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on LocalizedText {  
            text
          }
        `
      }
    }
  )
)(({viewer})=>
  <span>
        {viewer ? viewer.text : undefined}
  </span>
);

export default LocalizedText;

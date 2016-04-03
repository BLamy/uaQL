// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import DataValue from './DataValue';
import DataType from './DataType';





const Value = compose(

  createContainer(
    {
      fragments: {
        widgetviewer: () => Relay.QL`
          fragment on UANode {
            ${DataValue.getFragment('viewer')}
            ${DataType.getFragment('viewer')}
          
          }
        `
      }
    }
  )

)(({widgetviewer})=>
  <div>
    <DataType viewer={widgetviewer}/>
    <DataValue viewer={widgetviewer}/>
  </div>
);


export default Value;

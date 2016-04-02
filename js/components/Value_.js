// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import Pipe from './Pipe';
import Valve from './svg/Valve';
import Pump from './svg/Pump';
import Mixer from './svg/Mixer';
import FlowMeter from './svg/FlowMeter';
import Tank from './svg/Tank';
import NewValve from './svg/NewValve';
import Temperature from './svg/Temperature';

import Level from './svg/Level';

import Component from './Component';
import Components from './Components';

import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';

import ReferenceLink from './ReferenceLink';

const MyComponents = Components(Component);

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

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







const ForwardList = compose(

  createContainer(
    {
      fragments: {
        widgetviewer: () => Relay.QL`
          fragment on UANode {
            forwardReferences: references(first:100 browseDirection: Forward) {
              edges {
                node {
                  ${ReferenceLink.getFragment('viewer')}
                  id
                }
              }
            }
          }
        `
      }
    }
  )

)(({widgetviewer})=>
  <List>
    {widgetviewer.forwardReferences.edges.map(r=>
      <ListItem key={r.node.id}>
        <ReferenceLink viewer={r.node}/>  
      </ListItem>
    )}
  </List>
);


export default ForwardList;

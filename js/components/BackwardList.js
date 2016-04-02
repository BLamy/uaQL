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








const BackwardList = compose(

  createContainer(
    {
      fragments: {
        widgetviewer: () => Relay.QL`
          fragment on UANode {
            backReferences: references(first:10 browseDirection: Inverse) {
              edges {
                node {
                  id
                  ${ReferenceLink.getFragment('viewer')}
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
    {widgetviewer.backReferences.edges.map(r=>
      <ListItem key={r.node.id}>
        <ReferenceLink viewer={r.node}/>  
      </ListItem>
    )}
  </List>
);


export default BackwardList;

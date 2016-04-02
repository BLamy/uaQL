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
import ReferenceTypeIcon from './ReferenceTypeIcon';
import ActionGrade from 'material-ui/lib/svg-icons/action/grade';


import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';








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
                  ${ReferenceTypeIcon.getFragment('viewer')}
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

  <Table selectable={false}>
    <TableBody displayRowCheckbox={false}>
      {widgetviewer.forwardReferences.edges.map(r=>
        <TableRow>
          <TableRowColumn style={{width:'20px', padding:'0px'}}><ReferenceTypeIcon viewer={r.node}/></TableRowColumn>
          <TableRowColumn><ReferenceLink viewer={r.node}/></TableRowColumn>
        </TableRow>
      )}
    </TableBody>
  </Table>
);


export default ForwardList;

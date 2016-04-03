// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import ReferenceLink from './ReferenceLink';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';
import AppBar from 'material-ui/lib/app-bar';
import Menu from 'material-ui/lib/menus/menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import FlatButton from 'material-ui/lib/flat-button';
import IconButton from 'material-ui/lib/icon-button';
import ActionHome from 'material-ui/lib/svg-icons/action/home';


import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';





const NodeMenu = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {
            nodeClass
            displayName {
              text
            }
            references(first: 1000, referenceTypeId: "ns=0;i=40") {
              edges {
                node {
                  id
                  browseName {
                    namespaceIndex
                    name
                  }
                  uaNode {
                    displayName {
                      text
                    }                    
                  }
                }
              }
            }
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
)(({viewer,    params})=> 



<Table selectable={false}>
    <TableBody displayRowCheckbox={false}>
    {viewer.nodeClass==="Variable" 
        ? <TableRow>
            <TableRowColumn>
              <FlatButton
                containerElement={
                  <Link to = {`/${params.nodeId}/value`}/>
                }
                label="Value"/>              
            </TableRowColumn>
          </TableRow>
          : null
      }
      {viewer.nodeClass==="Method" 
        ? <TableRow>
            <TableRowColumn>
              <FlatButton
                containerElement={
                  <Link to = {`/${params.nodeId}/execute`}/>
                }
                label="Execute"/>
            </TableRowColumn>
          </TableRow>
          : null
      }
      {viewer.references.edges
        .map(e=>e.node)
        .filter(node => 
          node.uaNode.displayName.text === 'BoilerType'
          || node.uaNode.displayName.text === 'FlowControllerType'
          || node.uaNode.displayName.text === 'LevelControllerType'
          || node.uaNode.displayName.text === 'BoilerInputType'
          || node.uaNode.displayName.text === 'BoilerDrumType'
          || node.uaNode.displayName.text === 'BoilerOutputType'
          || node.uaNode.displayName.text === 'CustomControllerType'
          || node.uaNode.displayName.text === 'BoilerStateMachineType'
        )
        .map(node=> 
          <TableRow key={node.id}>
            <TableRowColumn>
              <FlatButton
                containerElement={
                  <Link to = {`/${params.nodeId}/mimic`}/>
                }
                label="Mimic"/>              
            </TableRowColumn>
          </TableRow>
      )}
    </TableBody>
  </Table>

);

export default NodeMenu;

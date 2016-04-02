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


const Comp = compose(
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
)(({viewer, path})=> 
  <AppBar
    title={`${viewer.nodeClass} - ${viewer.displayName.text}`}
    iconClassNameRight="muidocs-icon-navigation-expand-more">
    <MenuItem 
        containerElement = {<Link to = {`/${path}/backwardlist`}/>} 
        primaryText="backward" />
      <MenuItem 
        containerElement = {<Link to = {`/${path}/forwardlist`}/>} 
        primaryText="forward" />
      {viewer.nodeClass==="Variable" 
        ? <MenuItem
            containerElement = {<Link to = {`/${path}/value`}/>}
            primaryText= "value"/>
        : <span/>
      }
      {viewer.references.edges
        .map(e=>e.node)
        .map(node=>
          <MenuItem 
            key={node.id}s
            containerElement = {<Link to = {`/${path}/mimic`}/>}
            primaryText= {`${node.uaNode.displayName.text} mimic`}/>
          )
      }

      
  </AppBar>

);

export default Comp;

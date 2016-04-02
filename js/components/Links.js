// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import LocalizedText from './LocalizedText';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import {Link} from 'react-router';
import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';
import FlatButton from 'material-ui/lib/flat-button';
import Menu from 'material-ui/lib/menus/menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import ReferenceLink from './ReferenceLink';






const Links = compose(

  createContainer(
    {
      fragments: {
        root: ()=> Relay.QL`
          fragment on UANode {
            serverNamespaces: browsePath(paths:["Objects", "Server", "NamespaceArray"]) {
              dataValue { 
                ... on UaStringArray {value}
              }
            } 
          }
        `,
        viewer: () => Relay.QL`
          fragment on UANode {
            nodeClass
            backReferences: references(first:10 browseDirection: Inverse) {
              edges {
                node {
                  id
                  ${ReferenceLink.getFragment('viewer')}
                }
              }
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
          }
        `
      }
    }
  )

)(({viewer, root, path})=> {


  const style = {
    marginRight: 32,
    marginBottom: 32,
    float: 'left',
    position: 'relative',
    zIndex: 0,
  };
return <span/>
  return <Menu style={style}>
  {viewer.backReferences.edges.map((r,i) =>

          <ReferenceLink key = {r.node.id} viewer={r.node}/>
      )}
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
    </Menu>

  return <Tabs>

    <Tab 
      style={{marginTop: '15px'}}
      containerElement = {<FlatButton></FlatButton>}
      label= "forward"/>

    <Tab 
      containerElement = {<Link to = {`/${path}/forwardlist`}/>}
      label= "forward"/>
    {viewer.nodeClass==="Variable" 
      ? <Tab
          style={{marginTop: '15px'}}
          containerElement = {<Link to = {`/${path}/value`}/>}
          label= "value"/>
      : <Tab/>
    }
    {viewer.references.edges
      .map(e=>e.node)
      .map(node=>
        <Tab 
          style={{marginTop: '15px'}}
          key={node.id}
          containerElement = {<Link to = {`/${path}/mimic`}/>}
          label= {`${node.uaNode.displayName.text} mimic`}/>
      )
    }
  </Tabs>

});

export default Links;

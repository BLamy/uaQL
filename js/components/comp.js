// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import ReferenceLink from './ReferenceLink';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';
import ActionHome from 'material-ui/lib/svg-icons/action/home';

import { browserHistory } from 'react-router'

//const goHome1= ()=> setTimeout(()=>window.location = '/ns=0;i=84',500);

const goTo= (path) => ()=> browserHistory.push(path)



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
    //onLeftIconButtonTouchTap={goTo('/ns=0;i=84')}
    onTitleTouchTap = {goTo(`/${path}`)}
    title={`${viewer.nodeClass} - ${viewer.displayName.text}`}
    titleStyle={{cursor: 'pointer'}}
    iconElementLeft={<IconButton onClick={goTo('/ns=0;i=84')}><ActionHome /></IconButton>}
    >
    
      
  </AppBar>

);

export default Comp;

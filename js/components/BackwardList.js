// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';

import ReferenceLink from './ReferenceLink';

import ReferenceTable from './ReferenceTable';
import ReferenceTypeIcon from './ReferenceTypeIcon';


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
                  ${ReferenceTypeIcon.getFragment('viewer')}
                }
              }
            }
          }
        `
      }
    }
  )

)(({widgetviewer})=>
  <ReferenceTable references = {widgetviewer.backReferences.edges}/>
);


export default BackwardList;

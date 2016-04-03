// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';

import ReferenceLink from './ReferenceLink';

import ReferenceTable from './ReferenceTable';
import ReferenceTypeIcon from './ReferenceTypeIcon';


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
  <ReferenceTable references = {widgetviewer.forwardReferences.edges}/>
);


export default ForwardList;

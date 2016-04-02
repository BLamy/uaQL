'use strict';
// @flow

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import ActionGrade from 'material-ui/lib/svg-icons/action/grade';
import ActionAssignment from 'material-ui/lib/svg-icons/action/assignment';

const ReferenceTypeIcon = compose(
  createContainer(
    {
      fragments: {
        viewer: () => Relay.QL`
          fragment on ReferenceDescription {
            referenceTypeId {
              uaNode {
                displayName {
                  text
                }
              }  
            }
          }
         `
        }
    }
  )
)(({viewer})=> {
  switch(viewer.referenceTypeId.uaNode.displayName.text) {
    case 'HasComponent' : 
      return <ActionGrade title={viewer.referenceTypeId.uaNode.displayName.text}/>

    
  }
  return <ActionAssignment/>
}
    
    
    
);

export default ReferenceTypeIcon;

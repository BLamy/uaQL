'use strict';
// @flow

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose} from 'recompose';
import ActionGrade from 'material-ui/lib/svg-icons/action/grade';
import ActionAssignment from 'material-ui/lib/svg-icons/action/assignment';
import FileFolder from 'material-ui/lib/svg-icons/file/folder';
import ContentArchive from 'material-ui/lib/svg-icons/content/archive';
import ContentSend from 'material-ui/lib/svg-icons/content/send';
import CommunicationCall from 'material-ui/lib/svg-icons/communication/call';
import ActionHelp from 'material-ui/lib/svg-icons/action/help';
import ActionAlarm from 'material-ui/lib/svg-icons/action/alarm';

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
      return <ActionGrade/>
    case 'Organizes' : 
      return <FileFolder/>
    case 'HasSubtype' : 
      return <ContentArchive/>
    case 'HasTypeDefinition' : 
      return <ContentSend/>
    case 'HasNotifier' : 
      return <CommunicationCall/>
    case 'HasProperty' : 
      return <ActionAssignment/>
    case 'HasEventSource' : 
      return <ActionAlarm/>
  }
  return <ActionHelp/>
}
    
    
    
);

export default ReferenceTypeIcon;

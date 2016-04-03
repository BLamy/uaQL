// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {createContainer} from 'recompose-relay';
import {compose,  doOnReceiveProps} from 'recompose';
import DataValue from './DataValue';
import DataType from './DataType';
import observeMultiProps from './util/observeMultiProps';

import FloatingActionButton from 'material-ui/lib/floating-action-button';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';


class CallUAMethodMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {callUAMethod}`;
  }
  getVariables() {
    return {
      id: this.props.viewer.id,
      parent: this.props.viewer.self.backReferences2.edges[0].node.uaNode.id
    };
  }
  getFatQuery() {
    return Relay.QL`
      fragment on CallUAMethodPayload {
        uaNode {outputArguments}
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        uaNode: this.props.viewer.id
      }
    }];
  }
 }

const onFailure = (transaction) => {
  var error = transaction.getError() || new Error('Mutation failed.');
  alert(error);
};

const _handleMethod = (viewer)=>
    // To perform a mutation, pass an instance of one to `Relay.Store.commitUpdate`
 	()=>
 		Relay.Store.commitUpdate(new CallUAMethodMutation({viewer: viewer}), {onFailure});

const Execute = compose(

  createContainer(
    {
     
      fragments: {
        widgetviewer: () => Relay.QL`
          fragment on UANode {
          	id
          	nodeId {
          		value
          	}
          	self {
  	      		id
  	      		nodeId {
  	      			value
  	      			namespace
  	      		}
              backReferences2: references(first:10 browseDirection: Inverse referenceTypeId: "ns=0;i=47")
            
             {
              edges {
                node {
                  id
                  uaNode {
                  id
                }
                }
              }
            }
          	}
          	
            parent {
	          id
	            uaNode {
	              id
	            }
	          }

          }
        `
      }
    }
  ),
  
  observeMultiProps([
    {
      name: 'executable',
      attributeId: 'Executable',
      property: 'self'
    }
  ], 'widgetviewer'),

  

)(({widgetviewer, executable})=>
  <div>
  	<h1>Execute</h1> 

  	{executable && executable.value && executable.value.value && executable.value.value.value
  		? <FloatingActionButton onMouseUp={_handleMethod(widgetviewer)} >
          <ContentAdd />
        </FloatingActionButton> 
  		: "no go"
  	}
  	
    
  </div>
);


export default Execute;

// @flow

'use strict';


import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';

import Comp from './comp';
import ReferenceLink from './ReferenceLink';
import NodeName from './NodeName';
import NodeId from './NodeId';
import Links from './Links';
import LocalizedText from './LocalizedText';
import DataValue from './DataValue';
import DataType from './DataType';
import {compose} from 'recompose';
import {createContainer} from 'recompose-relay';
import Simple from './Simple'; 
import RaisedButton from 'material-ui/lib/raised-button';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ScrollArea from 'react-scrollbar';

import ForwardList from './ForwardList';
import BackwardList from './BackwardList';
import {Grid, Row, Col} from 'react-flexbox-grid/lib';



class UaNodeMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {updateUANode}`;
  }
  getVariables() {
    return {
      id: this.props.viewer.id,
      value: value,
      dataType: this.props.viewer.dataValue.value.dataType
    };
  }
  getFatQuery() {
    return Relay.QL`
      fragment on UpdateUANodePayload {
        uaNode
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
  static fragments = {
    viewer: () => Relay.QL`
      fragment on UANode {
        dataValue {
          value {
            dataType
          }
        }
      }
    `
  };
}


  



var onFailure = (transaction) => {
  var error = transaction.getError() || new Error('Mutation failed.');
  alert(error);
};



class App extends React.Component {
  
   _handleCount(){
    // To perform a mutation, pass an instance of one to `Relay.Store.commitUpdate`
    Relay.Store.commitUpdate(new UaNodeMutation({viewer: this.props.viewer}), {onFailure});
    value++;
  }
  
  render() {
    let scrollbarStyles = {borderRadius: 5};

    return (
      <div>
      

        <Comp viewer={this.props.viewer} path={this.props.params.nodeId}/>
        <Links {...this.props} path={this.props.params.nodeId}/>
        
        

      <Grid fluid>   
        <Row>
          <Col xs={12} sm={3} md={3} lg={3}>
            <BackwardList  widgetviewer={this.props.viewer}/>
          </Col>
          <Col xs>
            <h1>
              <NodeName viewer={this.props.viewer}/>
            </h1>
            <div>
              <LocalizedText viewer={this.props.viewer.description}/>
            </div>
            {this.props.children}
          </Col>
          <Col xs={12} sm={3} md={3} lg={3}>
            <ForwardList widgetviewer={this.props.viewer}/>
          </Col>
        </Row>
      </Grid>


        

        <ul>
          {(this.props.viewer.outputArguments || []).map(arg=>
            <li key={arg.index}>{arg.dataType} {arg.value.value}</li>
          )}
        </ul>
        
              
      </div>
    );
  }
}
const Appp = compose(
  createContainer( {
    fragments: {
      root: () => Relay.QL`
        fragment on UANode {
          ${Links.getFragment('root')}
          
          browsePath(paths:["Objects", "Server", "NamespaceArray"]) {
            dataValue { 
              ... on UaStringArray {value}
            }
          } 
        }
      `,
      viewer: () => Relay.QL`
        fragment on UANode {
          id
          nodeClass
          
          ${Links.getFragment('viewer')}
          ${Comp.getFragment('viewer')}
          ${NodeName.getFragment('viewer')}
          description {
            ${LocalizedText.getFragment('viewer')}
          }
          displayName {
            text
          }
          parent {
            id
            uaNode {
              id
            }
          }

          nodeId {
            ${NodeId.getFragment('viewer')}
          }
          ${ForwardList.getFragment('widgetviewer')}
          ${BackwardList.getFragment('widgetviewer')}
          outputArguments {
            index
            dataType
            arrayType
            value {
              ... on BooleanArgumentValue {value}  
              ... on IntArgumentValue {value}  
              ... on Int64ArgumentValue {value}  
              ... on FloatArgumentValue {value}  
              ... on StringArgumentValue {value}  
            }  
          }
        }
      `
    }
  })
)(App);

export default Appp;
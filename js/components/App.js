'use strict';

import React from 'react';
import Relay from 'react-relay';
import Comp from './comp';
import ReferenceLink from './ReferenceLink';
import NodeName from './NodeName';
import LocalizedText from './LocalizedText';
import NodeClassEnum from './NodeClassEnum';
var value = 0;


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
        dataValue{
          stringValue
          value{
            dataType
          }
        }
      }
    `
  };
}

class CallUAMethodMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {callUAMethod}`;
  }
  getVariables() {
    return {
      id: this.props.viewer.id,
      parent: this.props.viewer.parent.edges[0].node.uaNode.id
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
  
 /* static fragments = {
    viewer: () => Relay.QL`
      fragment on UANode {
        id
      }
    `
  };
*/
}


var onFailure = (transaction) => {
  var error = transaction.getError() || new Error('Mutation failed.');
  alert(error);
};



class App extends React.Component {
   _handleCount = () => {
    // To perform a mutation, pass an instance of one to `Relay.Store.commitUpdate`
    Relay.Store.commitUpdate(new UaNodeMutation({viewer: this.props.viewer}), {onFailure});
    value++;
  }
  _handleMethod = () => {
    // To perform a mutation, pass an instance of one to `Relay.Store.commitUpdate`
    Relay.Store.commitUpdate(new CallUAMethodMutation({viewer: this.props.viewer}), {onFailure});
  }

  render() {
    return (
      <div>
        <Comp viewer={this.props.viewer}/>
        <h1>
          <NodeName viewer={this.props.viewer}/>
        </h1>
        <button onClick={this._handleCount}>Like this</button>
        <button onClick={this._handleMethod}>Method Call</button>
        <h2 title='dataType'>
        {this.props.viewer.dataType.value ?
          <NodeName viewer={this.props.viewer.dataType.value.value.uaNode}/>
          : 'no data type'}
        </h2>
        <h3 title='nodeId'>
          {this.props.viewer.nodeId.stringValue}
        </h3>
        <h4 title='nodeClass'>
          <NodeClassEnum viewer= {this.props.viewer.nodeClassEnum}/>
        </h4>
        <div title='value'>
          {this.props.viewer.dataValue.stringValue}
        </div>
        <LocalizedText viewer={this.props.viewer.description}/>

        <ul>
          {this.props.viewer.forwardReferences.edges.map(r=>
            <li key={r.node.id}>
              <ReferenceLink viewer={r.node}/>  
            </li>
          )}
        </ul>
        <ul>
          {(this.props.viewer.outputArguments || []).map(arg=>
            <li key={arg.index}>{arg.dataType} {arg.value.value}</li>
          )}
        </ul>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on UANode {
        id
        nodeClassEnum {
          ${NodeClassEnum.getFragment('viewer')}
        }
        ${Comp.getFragment('viewer')}
        ${NodeName.getFragment('viewer')}
        description {
            ${LocalizedText.getFragment('viewer')}
        }
        dataType  { 
          value { 
            value {
              uaNode {
                ${NodeName.getFragment('viewer')}  
              }
            }
          }
        }
        nodeId{stringValue}    
        dataValue{
          stringValue
          value{
            dataType
          }
        }  
        forwardReferences: references(first:100 browseDirection: Forward) {
          edges {
            node {
              ${ReferenceLink.getFragment('viewer')}
              id
            }
          }
        },
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
});

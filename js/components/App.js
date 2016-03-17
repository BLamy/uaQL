'use strict';

import React from 'react';
import Relay from 'react-relay';

var value = 0;

class CountMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {updateCount}`;
  }
  getVariables() {
    return {
      id: this.props.count.id
    };
  }
  getFatQuery() {
    return Relay.QL`
      fragment on UpdateCountPayload {
        count
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        count: this.props.count.id
      },
    }];
  }
  getOptimisticResponse() {
    return {
      count: {
        id: this.props.count.id,
        count: this.props.count.count + 1
        
      }
    };
  }
 static fragments = {
    count: () => Relay.QL`
      fragment on Count {
        count
        id
      }
    `,
  };
}

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
      },
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
    `,
  };
}

class CallUAMethodMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation {callUAMethod}`;
  }
  getVariables() {
    return {
      id: this.props.viewer.id,
      parent: this.props.viewer.parent.id
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
      },
    }];
  }
  static fragments = {
    viewer: () => Relay.QL`
      fragment on UANode {
        parent {id}
      }
    `,
  };
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
        <h1>Widget list</h1>
        <button onClick={this._handleCount}>Like this</button>
        <button onClick={this._handleMethod}>Method Call</button>
        
        <h2>{this.props.viewer.id}</h2>
        <h2>{this.props.viewer.nodeId.stringValue}</h2>
        <h2>{this.props.count.count}</h2>
        {this.props.viewer.browseName.value.value.name}
        {this.props.viewer.dataValue.stringValue}
        <ul>
          {this.props.viewer.references.edges.map(r=>
            <li>{r.node.browseName.name} {r.node.uaNode.id}</li>
          )}
        </ul>
        <ul>
          {(this.props.viewer.outputArguments || []).map(arg=>
            <li>{arg.dataType} {arg.value.value}</li>
          )}
        </ul>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    count: ()=> Relay.QL`
      fragment on Count {
        count
        id
      }
    `,
    viewer: () => Relay.QL`
      fragment on UANode {
        id
        parent {id}
        nodeId{stringValue}    
        dataValue{
          stringValue
          value{
            dataType
          }
        }  
        browseName{value{value{name}}}    
        references(first: 10) {
          edges {
            node {
              browseName {
                name
              }
              uaNode {
                id
              }
            }
          }
        },
        outputArguments {
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
    `,
  },
});

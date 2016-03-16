'use strict';

import React from 'react';
import Relay from 'react-relay';


class CountMutation extends Relay.Mutation {
  // This method should return a GraphQL operation that represents
  // the mutation to be performed. This presumes that the server
  // implements a mutation type named ‘likeStory’.
  getMutation() {
    console.log('getting...');
    return Relay.QL`mutation {updateCount}`;
  }
  // Use this method to prepare the variables that will be used as
  // input to the mutation. Our ‘likeStory’ mutation takes exactly
  // one variable as input – the ID of the story to like.
  getVariables() {
    console.log('getting');
    console.log('sending id:', this.props.count.id);
    return {id: this.props.count.id};
  }
  // Use this method to design a ‘fat query’ – one that represents every
  // field in your data model that could change as a result of this mutation.
  // Liking a story could affect the likers count, the sentence that
  // summarizes who has liked a story, and the fact that the viewer likes the
  // story or not. Relay will intersect this query with a ‘tracked query’
  // that represents the data that your application actually uses, and
  // instruct the server to include only those fields in its response.
  getFatQuery() {
    return Relay.QL`
      fragment on UpdateCountPayload {
        count
      }
    `;
  }
  // These configurations advise Relay on how to handle the LikeStoryPayload
  // returned by the server. Here, we tell Relay to use the payload to
  // change the fields of a record it already has in the store. The
  // key-value pairs of ‘fieldIDs’ associate field names in the payload
  // with the ID of the record that we want updated.
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        count: this.props.count.id
        //id:this.props.counter.id
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
  // This mutation has a hard dependency on the story's ID. We specify this
  // dependency declaratively here as a GraphQL query fragment. Relay will
  // use this fragment to ensure that the story's ID is available wherever
  // this mutation is used.
  static fragments = {
    count: () => Relay.QL`
      fragment on Count {
        count
        id
      }
    `,
  };
}



class App extends React.Component {
   _handleCount = () => {
    // To perform a mutation, pass an instance of one to `Relay.Store.commitUpdate`
    Relay.Store.commitUpdate(new CountMutation({count: this.props.count}));
  }
  render() {
    return (
      <div>
        <h1>Widget list</h1>
        <button onClick={this._handleCount}>Like this</button>
        <h2>{this.props.viewer.id}</h2>
        <h2>{this.props.count.count}</h2>
        {this.props.viewer.browseName.value.value.name}
        <ul>
          {this.props.viewer.references.edges.map(r=>
            <li>{r.node.browseName.name} {r.node.uaNode.id}</li>
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
        } 
      }
    `,
  },
});

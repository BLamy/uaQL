import React from 'react';
import Relay from 'react-relay';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Widget list..</h1>
        <h2>{this.props.viewer.browseName.name}</h2>
        <ul>
          {this.props.viewer.references.edges.map(edge =>
            <li key={edge.node.id}>
              {edge.node.browseName.name} (ID: {edge.node.id})
              <ul>
                {edge.node.references.edges.map(edge =>
                  <li key={edge.node.id}>
                    {edge.node.browseName.name} (ID: {edge.node.id})
                  </li>
                )}
              </ul>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on ReferenceDescription {
        id,
        browseName {
          namespaceIndex
          name
        },
        references(first: 10) {
          edges {
            node {
              id,
              browseName {
                namespaceIndex
                name
              },
              references(first: 10) {
                edges {
                  node {
                    id,
                    browseName {
                      namespaceIndex
                      name
                    },
                  },
                },
              },
            },
          },
        },
      }
    `,
  },
});

'use strict';
import Relay from 'react-relay';

export default class extends Relay.Route {
  static queries = {
    viewer: () => Relay.QL`
      query {
        uaNode(nodeId:"ns=2;i=10756")

      }
    `,
    count: () => Relay.QL`
      query {
        count(id:"ns=2;i=10216")
        
      }
    `
  };
  static routeName = 'AppHomeRoute';
}

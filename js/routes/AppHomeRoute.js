// @flow

'use strict';

import Relay from 'react-relay';

export default class extends Relay.Route {
	constructor({nodeId, namespace, value}: {nodeId: string, namespace: string, value: string}) {
		super({nodeId: nodeId || `ns=${namespace};i=${value}`});
		console.log('kjhvkhgcjhgcjgc');
	}
  static queries = {
    viewer: () => Relay.QL`
      query {
        uaNode(nodeId: $nodeId)
      }
    `
  };
  static paramDefinitions = {
    nodeId: {required: false},
    value: {required: false},
    namespace: {required: false},
    identifierType: {required: false}
  };
  static routeName = 'AppHomeRoute';
}


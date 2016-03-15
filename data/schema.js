'use strict';
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  connectionFromPromisedArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  // Import methods that your schema can use to interact with your database
  User,
  Widget,
  getUser,
  getViewer,
  getWidget,
  getWidgets,
} from './database';


import uaSession from './opcua';
import merge from 'merge';
/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
 /*
var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'User') {
      return getUser(id);
    } else if (type === 'Widget') {
      return getWidget(id);
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof User) {
      return userType;
    } else if (obj instanceof Widget)  {
      return widgetType;
    } else {
      return null;
    }
  }
);


console.log("nodeint ", nodeInterface);


*/




/**
 * Define your own types here
 */

var userType = new GraphQLObjectType({
  name: 'User',
  description: 'A person who uses our app',
  fields: () => ({
    id: globalIdField('User'),
    widgets: {
      type: widgetConnection,
      description: 'A person\'s collection of widgets',
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(getWidgets(), args),
    },
  }),
  //interfaces: [nodeInterface],
});

var widgetType = new GraphQLObjectType({
  name: 'Widget',
  description: 'A shiny widget',
  fields: () => ({
    id: globalIdField('Widget'),
    name: {
      type: GraphQLString,
      description: 'The name of the widget',
    },
  }),
  //interfaces: [nodeInterface],
});

/**
 * Define your own connection types here
 */
var {connectionType: widgetConnection} =
  connectionDefinitions({name: 'Widget', nodeType: widgetType});

/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    // Add your own root fields here
    viewer: {
      type: userType,
      resolve: () => getViewer(),
    },
  }),
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    // Add your own mutations here
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
/*export var Schema = new GraphQLSchema({
  query: queryType,
  // Uncomment the following after adding some mutation fields:
  // mutation: mutationType
});*/






var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'ReferenceDescription') {
      return getReference(id);
    } else {
      return null;
    }
  },
  (obj) => {
    return ReferenceDescriptionType;
    if (obj instanceof User) {
      return userType;
    } else if (obj instanceof Widget)  {
      return widgetType;
    } else {
      return null;
    }
  }
);

console.log("nodeint ", nodeInterface);

// http://node-opcua.github.io/api_doc/classes/QualifiedName.html
const QualifiedNameType = new GraphQLObjectType({
  name: 'QualifiedName',
  fields: {
    namespaceIndex: { type: GraphQLInt },
    name: { type: GraphQLString }
  }
});

// http://node-opcua.github.io/api_doc/classes/QualifiedName.html
const LocalizedTextType = new GraphQLObjectType({
  name: 'LocalizedText',
  fields: {
    text: { type: GraphQLString },
    locale: { type: GraphQLString } // says localId??
  }
});



const BooleanValueType = new GraphQLObjectType({
  name: 'BooleanValue',
  fields: {
    value: { type: GraphQLBoolean },
    dataType: { type: GraphQLString },
    arrayType: { type: GraphQLString },
    dimensions: { type: GraphQLInt },
    expired: { type: GraphQLBoolean }
  }
});

const BooleanArrayValueType = new GraphQLObjectType({
  name: 'BooleanArrayValue',
  fields: {
    value: { type: new GraphQLList(GraphQLBoolean)},
    dataType: { type: GraphQLString },
    arrayType: { type: GraphQLString },
    dimensions: { type: GraphQLInt },
    expired: { type: GraphQLBoolean }
  }
});



const ValueType = new GraphQLUnionType({
  name: 'Value',
  types: [BooleanValueType, BooleanArrayValueType],
  resolveType(value){
    if (value.arrayType === 1) {
      console.log('it was bool array!', value.arrayType);
       return BooleanArrayValueType;
    }
    else {
      console.log('it was bool!');
      return BooleanValueType;
    }
  }
});

const StatusCodeType = new GraphQLObjectType({
  name: 'StatusCode',
  fields: {
    value: { type: GraphQLInt },
    description: { type: GraphQLString },
    name: { type: GraphQLString }
  }
});




// http://node-opcua.github.io/api_doc/classes/DataValue.html
const DataValueType = new GraphQLObjectType({
  name: 'DataValue',
  fields: {
    serverPicoseconds: { type: GraphQLInt },
    serverTimestamp: { type: GraphQLString }, //needs type
    sourcePicoseconds: { type: GraphQLInt },
    sourceTimestamp: { type: GraphQLString }, //needs type
    value: { type: ValueType }, //needs type
    stringValue: { type: GraphQLString },
    statusCode: { type: StatusCodeType } //needs type
  }
});

const ExpandedNodeIdType = new GraphQLObjectType({
  name: 'ExpandedNodeId',
  fields: {
    identifierType: { type: GraphQLString },
    value: { type: GraphQLString }, //needs type
    namespace: { type: GraphQLInt },
    namespaceUri: { type: GraphQLString }, //needs type
    serverIndex: { type: GraphQLInt }
  }
});


//  http://node-opcua.github.io/api_doc/classes/ReferenceDescription.html
const _NodeType = new GraphQLObjectType({
  name: '_Node',
  fields: ()=>({
    id: globalIdField('Node'),
    NodeId: { type: GraphQLString }, //1,
    NodeClass: { type: GraphQLString }, //2,
    BrowseName: { type: GraphQLString }, //3,
    DisplayName: { type: GraphQLString }, //4,
    Description: { type: GraphQLString }, //5,
    WriteMask: { type: GraphQLString }, //6,
    UserWriteMask: { type: GraphQLString }, //7,
    IsAbstract: { type: GraphQLString }, //8,
    Symmetric: { type: GraphQLString }, //9,
    InverseName: { type: GraphQLString }, //10,
    ContainsNoLoops: { type: GraphQLString }, //11,
    EventNotifier: { type: GraphQLString }, //12,
    Value: { type: GraphQLString }, //13,
    DataType: { type: GraphQLString }, //14,
    ValueRank: { type: GraphQLString }, //15,
    ArrayDimensions: { type: GraphQLString }, //16,
    AccessLevel: { type: GraphQLString }, //17,
    UserAccessLevel: { type: GraphQLString }, //18,
    MinimumSamplingInterval: { type: GraphQLString }, //19,
    Historizing: { type: GraphQLString }, //20,
    Executable: { type: GraphQLString }, //21,
    UserExecutable: { type: GraphQLString }, //22,
    

    value: {
        type: DataValueType,
        resolve: (reference) =>new Promise(function(resolve, reject){
            uaSession().readVariableValue(reference.nodeId, function(err, dataValue) {
              if (!err) {
                  console.log(JSON.stringify(dataValue));
                  resolve(merge(true, dataValue, {stringValue: JSON.stringify(dataValue.value ? dataValue.value.value : null)}));
              }
              else {
                  reject(err);
              }
            });

        })
    },
    references: {
      type: ReferenceConnection,
      args: connectionArgs,
      resolve: (reference, args) => connectionFromPromisedArray(
        new Promise(function(resolve, reject){
            uaSession().browse(reference.nodeId, function(err, browseResult){
              if(!err) {
                resolve(browseResult[0].references.map(r=>{
                  r.id = r.nodeId.toString();
                  console.log('@@@', r.id);
                  return r;
                }));
              }
              else {
                reject(err);
              }
            });
          }),
        args
      )
    },
  }),
  interfaces: [nodeInterface]  
    

});



//  http://node-opcua.github.io/api_doc/classes/ReferenceDescription.html
const ReferenceDescriptionType = new GraphQLObjectType({
  name: 'ReferenceDescription',
  fields: ()=>({
    id: globalIdField('ReferenceDescription'),
    browseName: {type: QualifiedNameType},
    displayName: {type: LocalizedTextType},
    isForward: {type: GraphQLBoolean},
    nodeClass: { type: GraphQLString },
    nodeId: { type: ExpandedNodeIdType }, //??
    referenceTypeId: { type: GraphQLString },
    typeDefinition: { type: GraphQLString }, //??
    value: {
        type: DataValueType,
        resolve: (reference) =>new Promise(function(resolve, reject){
            uaSession().readVariableValue(reference.nodeId, function(err, dataValue) {
              if (!err) {
                  console.log(JSON.stringify(dataValue));
                  resolve(merge(true, dataValue, {stringValue: JSON.stringify(dataValue.value ? dataValue.value.value : null)}));
              }
              else {
                  reject(err);
              }
            });

        })
    },
    references: {
      type: ReferenceConnection,
      args: connectionArgs,
      resolve: (reference, args) => connectionFromPromisedArray(
        new Promise(function(resolve, reject){
            uaSession().browse(reference.nodeId, function(err, browseResult){
              if(!err) {
                resolve(browseResult[0].references.map(r=>{
                  r.id = r.nodeId.toString();
                  console.log('@@@', r.id);
                  return r;
                }));
              }
              else {
                reject(err);
              }
            });
          }),
        args
      )
    },

  }),
  interfaces: [nodeInterface]  
    

});

var {connectionType: ReferenceConnection} =
  connectionDefinitions({name: 'Reference', nodeType: ReferenceDescriptionType});


const getReference = (nodeId)=> {
  return new Promise(function(resolve, reject){
      //seems a little nuts have to browse twice...
       uaSession().browse(nodeId, function(err, browseResult){
        if(!err) {
            console.log(JSON.stringify(browseResult, null, '\t'));
            const firstChild = browseResult[0].references.filter((r)=>r.isForward)[0];
            console.log("here it is", firstChild.nodeId.toString());
            console.log("jsoned", JSON.stringify(firstChild.nodeId));
            console.log("jsoned", JSON.stringify(Object.keys(firstChild.nodeId)));
            console.log(firstChild.nodeId.identifierType.toString());
            uaSession().browse(firstChild.nodeId, function(err, browseResult2){
              console.log(nodeId.toString());
              const res = browseResult2[0].references.filter((f)=>!f.isForward)[0];
              res.id = nodeId;
              console.log('---', nodeId);
              //resolve(merge(true, browseResult2[0].references.filter((f)=>!f.isForward)[0], {id: nodeId.toString()}));
              resolve(res);
            });
        }
        else {
          reject(err);
        }
      });

  });
};


/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    // Add your own root fields here
    user: {
        type: ReferenceDescriptionType,
        args: {
          nodeId: { type: GraphQLString },
        },
        resolve: function (_, args) {
          return getReference(args.nodeId || 'RootFolder');
        }
      }
  }),
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    // Add your own mutations here
  })
});




// as default};

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var Schema = new GraphQLSchema({
  query: queryType,
  // Uncomment the following after adding some mutation fields:
  // mutation: mutationType
});

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
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  //connectionFromArray,
  connectionFromPromisedArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import uaSession, {opcua} from './opcua';
import merge from 'merge';



var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'ReferenceDescription') {
      return getReference(id);
    } else
    if (type === 'UANode') {
      return getUANode(id);
    }
    if (type === 'Count') {
      return getCount(id);
    }
    else {
      return null;
    }
  },
  (obj) => {
    if(obj.type === 'ReferenceDescriptionType') {
      return ReferenceDescriptionType;
    }
    else if(obj.type === 'UANodeType') {
      return UANodeType;
    }
    else if(obj.type === 'CountType') {
      return CountType;
    }
  }
);

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
  name: 'BooleanValueChangethis',
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

const genericValueType = (type, name)=> new GraphQLObjectType({
  name: name,
  fields: {
    dataType: { type: GraphQLString },
    arrayType: { type: GraphQLString },
    value: {type: type}
  }
});

const genericResultType = (type, name)=> new GraphQLObjectType({
  name: name,
  fields: {
    value: { type: type },
    stringValue: { type: GraphQLString },
    statusCode: { type: StatusCodeType },
    serverPicoseconds: { type: GraphQLInt },
    serverTimestamp: { type: GraphQLString }, //needs type
    sourcePicoseconds: { type: GraphQLInt }
  }
});



const QualifiedNameValueType = genericValueType(QualifiedNameType, 'QualifiedNameValue');
const QualifiedNameResultType = genericResultType(QualifiedNameValueType, 'QualifiedNameResult');


const LocalizedTextValueType = genericValueType(LocalizedTextType, 'LocalizedTextValue');
const LocalizedTextResultType = genericResultType(LocalizedTextValueType, 'LocalizedTextResult');


const ExpandedNodeIdValueType = genericValueType(ExpandedNodeIdType, 'ExpandedNodeIdValue');
const ExpandedNodeIdResultType = genericResultType(ExpandedNodeIdValueType, 'ExpandedNodeIdResult');

const NodeClassEnumValueType = genericValueType(new GraphQLEnumType({
  name: 'NodeClass',
  values: {
    Unspecified: { value: 0 },  // No classes are selected.
    Object: { value: 1 },  // The node is an object.
    Variable: { value: 2 },  // The node is a variable.
    Method: { value: 4 },  // The node is a method.
    ObjectType: { value: 8 },  // The node is an object type.
    VariableType: { value: 16 },  // The node is an variable type.
    ReferenceType: { value: 32 },  // The node is a reference type.
    DataType: { value: 64 },  // The node is a data type.
    View: { value: 128 }   // The node is a view.
  }
}), 'NodeClassEnumValue');
const NodeClassEnumResultType = genericResultType(NodeClassEnumValueType, 'NodeClassEnumValueResult');



const IntResultType = genericResultType(genericValueType(GraphQLInt, 'IntValue'), 'IntResult');
const BooleanResultType = genericResultType(genericValueType(GraphQLBoolean, 'BooleanValue'), 'BooleanResult');
const StringResultType = genericResultType(genericValueType(GraphQLString, 'StringValue'), 'StringResult');
const FloatResultType = genericResultType(genericValueType(GraphQLFloat, 'FloatValue'), 'FloatResult');
const IntListResultType = genericResultType(genericValueType(new GraphQLList(GraphQLInt), 'IntListValue'), 'IntListResult');

const DataValueResultType = genericResultType(genericValueType(ValueType, 'DataValue'), 'DataValueResult');


const getProperty = (type, attributeId) => ({
  type: type,
  resolve: ({id})=> new Promise(function(resolve, reject){
    const nodesToRead = [
      {
        nodeId: id,
        attributeId: attributeId
      }
    ];
    uaSession().read(nodesToRead, function(err, _nodesToRead, results) {
        if (!err) {
            var ret = results[0];
            console.log(JSON.stringify(results[0], null, '\t'));
            resolve(merge(true, ret, {stringValue: JSON.stringify(ret.value ? ret.value.value : null)}));
        }
        else {
          reject(err);
        }
    });
  })
});


//  http://node-opcua.github.io/api_doc/classes/ReferenceDescription.html
const UANodeType = new GraphQLObjectType({
  name: 'UANode',
  fields: ()=>({
    id: globalIdField('UANode'),
    nodeId: getProperty(ExpandedNodeIdResultType, opcua.AttributeIds.NodeId), //1
    nodeClass: getProperty(IntResultType, opcua.AttributeIds.NodeClass), //2
    nodeClassEnum: getProperty(NodeClassEnumResultType, opcua.AttributeIds.NodeClass), //2
    browseName: getProperty(QualifiedNameResultType, opcua.AttributeIds.BrowseName), //3
    displayName: getProperty(LocalizedTextResultType, opcua.AttributeIds.DisplayName), //4
    description: getProperty(LocalizedTextResultType, opcua.AttributeIds.Description), //5,
    writeMask: getProperty(IntResultType, opcua.AttributeIds.WriteMask), //6,
    userWriteMask: getProperty(IntResultType, opcua.AttributeIds.UserWriteMask), //7,
    isAbstract: getProperty(BooleanResultType, opcua.AttributeIds.IsAbstract), //8,
    symmetric: getProperty(BooleanResultType, opcua.AttributeIds.Symmetric), //9,
    inverseName: getProperty(LocalizedTextResultType, opcua.AttributeIds.InverseName), //5,
    containsNoLoops: getProperty(BooleanResultType, opcua.AttributeIds.ContainsNoLoops), //11,
    eventNotifier: getProperty(IntResultType, opcua.AttributeIds.EventNotifier), //12,
    dataValue: getProperty(DataValueResultType, opcua.AttributeIds.DataValue), //13,
    dataType: getProperty(StringResultType, opcua.AttributeIds.DataType), //14,
    valueRank: getProperty(IntResultType, opcua.AttributeIds.ValueRank), //15,
    arrayDimensions: getProperty(IntListResultType, opcua.AttributeIds.ArrayDimensions), //16,  IntListResultType
    accessLevel: getProperty(IntResultType, opcua.AttributeIds.AccessLevel), //17,
    userAccessLevel: getProperty(IntResultType, opcua.AttributeIds.UserAccessLevel), //18,
    minimumSamplingInterval: getProperty(FloatResultType, opcua.AttributeIds.MinimumSamplingInterval), //19,
    historizing: getProperty(BooleanResultType, opcua.AttributeIds.Historizing), //20,
    executable: getProperty(BooleanResultType, opcua.AttributeIds.Executable), //21,
    userExecutable: getProperty(BooleanResultType, opcua.AttributeIds.UserExecutable), //22,
    references: {
      type: ReferenceConnection,
      args: connectionArgs,
      resolve: ({id}, args) => connectionFromPromisedArray(
        new Promise(function(resolve, reject){
            uaSession().browse(id, function(err, browseResult){
              if(!err) {
                resolve(browseResult[0].references.map(r=>{
                  r.id = r.nodeId.toString();
                  console.log('@@@', JSON.stringify(r, null, '\t'));
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
    }
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
    typeDefinition: { type: GraphQLString },
    uaNode: {
      type: UANodeType,
      resolve: (reference) => {
        return getUANode(reference.nodeId);
      }
    }

  }),
  interfaces: [nodeInterface]  
    

});

var {connectionType: ReferenceConnection} =
  connectionDefinitions({name: 'Reference', nodeType: ReferenceDescriptionType});

var {connectionType: NodeConnection} =
  connectionDefinitions({name: 'Node', nodeType: UANodeType});



const getReference = (nodeId)=> {
  return new Promise(function(resolve, reject){
      //seems a little nuts have to browse twice...
       uaSession().browse(nodeId, function(err, browseResult){
        if(!err) {
            const firstChild = browseResult[0].references.filter((r)=>r.isForward)[0];
            uaSession().browse(firstChild.nodeId, function(err2, browseResult2){
              if(!err2)
              {
                const res = browseResult2[0].references.filter((f)=>!f.isForward)[0];
                res.id = nodeId;
                res.type = 'ReferenceDescriptionType';
                resolve(res);  
              }
              else {
                reject(err2);
              }
              
            });
        }
        else {
          reject(err);
        }
      });

  });
};

const getUANode = (nodeId)=> {
  return {
    id: nodeId,
    type: 'UANodeType'
  };
};


const getCount = (id, count)=> {
  return {
    id: id,
    count: count,
    type: 'CountType'
  };
};


const CountType = new GraphQLObjectType({
  name: 'Count',
  fields: {
    id: globalIdField('Count'),
    count: { type: GraphQLInt }
  }
});


var UpdateCountMutation = mutationWithClientMutationId({
  name: 'UpdateCount',
  inputFields: {
    //clientMutationId: { type: new GraphQLNonNull(GraphQLID) },
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    count: {
      type: CountType,
      resolve: (payload) => {
        console.log('okkkk', payload);
        return payload;
      },
    }
  },
  mutateAndGetPayload: (all) => {
    console.log('mutate id', all);
    var countId = fromGlobalId(all.id).id;
    console.log('got here');
    count += 1;
    console.log(countId);
    console.log('VBACK!!');
    return new Promise(function(resolve, reject){
        setTimeout(()=>resolve(getCount(countId, count)), 1000);
     });
    return getCount(countId, count);
   
  },
});




/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 */
var count = 0;

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    uaNode: {
      type: UANodeType,
      args: {
        nodeId: {
          name: 'nodeId',
          type: GraphQLString
        }
      },
      resolve: function (_, {nodeId}) {
        return getUANode(nodeId || 'RootFolder');
      }
    },
    count: {
      type: CountType,
      args: {
        id: {
          name: 'id',
          type: GraphQLString
        }
      },
      resolve: function (_, {id}) {
        return getCount(id, count);
      }
    }
  })
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 */
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    // Add your own mutations here
    updateCount: UpdateCountMutation
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
  mutation: mutationType
});

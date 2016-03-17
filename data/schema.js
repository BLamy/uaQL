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
    namespaceIndex: {type: GraphQLInt },
    name: {type: GraphQLString }
  }
});

// http://node-opcua.github.io/api_doc/classes/QualifiedName.html
const LocalizedTextType = new GraphQLObjectType({
  name: 'LocalizedText',
  fields: {
    text: {type: GraphQLString },
    locale: {type: GraphQLString } // says localId??
  }
});

const genericTypedValueType = (name, type) => new GraphQLObjectType({
  name: name,
  fields: {
    value: {
      type: type
    }
  }
});


const StatusCodeType = new GraphQLObjectType({
  name: 'StatusCode',
  fields: {
    value: {type: GraphQLInt },
    description: {type: GraphQLString },
    name: {type: GraphQLString, description: 'really?'}
  }
});

const ExpandedNodeIdType = new GraphQLObjectType({
  name: 'ExpandedNodeId',
  fields: ()=>({
    identifierType: {type: GraphQLString },
    value: {type: GraphQLString }, //needs type
    namespace: {type: GraphQLInt },
    namespaceUri: {type: GraphQLString }, //needs type
    serverIndex: {type: GraphQLInt },
    uaNode: {type: UANodeType, resolve: getUANode}
  })
});

const genericValueType = (type, name)=> new GraphQLObjectType({
  name: name,
  fields: {
    dataType: {type: GraphQLString },
    arrayType: {type: GraphQLString },
    value: {type: type}
  }
});

const genericResultType = (type, name)=> new GraphQLObjectType({
  name: name,
  fields: {
    value: {type: type },
    stringValue: {type: GraphQLString },
    jsonValue: {type: GraphQLString },
    statusCode: {type: StatusCodeType },
    serverPicoseconds: {type: GraphQLInt },
    serverTimestamp: {type: GraphQLString }, //needs type
    sourcePicoseconds: {type: GraphQLInt }
  }
});

const BooleanTypedValueType = genericTypedValueType('BooleanTypedValue', GraphQLBoolean );
const SByteTypedValueType = genericTypedValueType('SByteTypedValue', GraphQLInt );
const ByteTypedValueType = genericTypedValueType('ByteTypedValue', GraphQLInt );
const Int16TypedValueType = genericTypedValueType('Int16TypedValue', GraphQLInt );
const UInt16TypedValueType = genericTypedValueType('UInt16TypedValue', GraphQLInt );
const Int32TypedValueType = genericTypedValueType('Int32TypedValue', GraphQLInt );
const UInt32TypedValueType = genericTypedValueType('UInt32TypedValue', GraphQLInt );
const Int64TypedValueType = genericTypedValueType('Int64TypedValue', GraphQLInt );
const UInt64TypedValueType = genericTypedValueType('UInt64TypedValue', GraphQLInt );
const FloatTypedValueType = genericTypedValueType('FloatTypedValue', GraphQLFloat );
const DoubleTypedValueType = genericTypedValueType('DoubleTypedValue', GraphQLFloat );
const StringTypedValueType = genericTypedValueType('StringTypedValue', GraphQLString );
const DateTimeTypedValueType = genericTypedValueType('DateTimeTypedValue', GraphQLString );
const GuidTypedValueType = genericTypedValueType('GuidTypedValue', GraphQLString );
const ByteStringTypedValueType = genericTypedValueType('ByteStringTypedValue', GraphQLString );

const BooleanTypedArrayValueType = genericTypedValueType('BooleanTypedArrayValue', new GraphQLList(GraphQLBoolean) );
const SByteTypedArrayValueType = genericTypedValueType('SByteTypedArrayValue', new GraphQLList(GraphQLInt) );
const ByteTypedArrayValueType = genericTypedValueType('ByteTypedArrayValue', new GraphQLList(GraphQLInt) );
const Int16TypedArrayValueType = genericTypedValueType('Int16TypedArrayValue', new GraphQLList(GraphQLInt) );
const UInt16TypedArrayValueType = genericTypedValueType('UInt16TypedArrayValue', new GraphQLList(GraphQLInt) );
const Int32TypedArrayValueType = genericTypedValueType('Int32TypedArrayValue', new GraphQLList(GraphQLInt) );
const UInt32TypedArrayValueType = genericTypedValueType('UInt32TypedArrayValue', new GraphQLList(GraphQLInt) );
const Int64TypedArrayValueType = genericTypedValueType('Int64TypedArrayValue', new GraphQLList(GraphQLInt) );
const UInt64TypedArrayValueType = genericTypedValueType('UInt64TypedArrayValue', new GraphQLList(GraphQLInt) );
const FloatTypedArrayValueType = genericTypedValueType('FloatTypedArrayValue', new GraphQLList(GraphQLFloat) );
const DoubleTypedArrayValueType = genericTypedValueType('DoubleTypedArrayValue', new GraphQLList(GraphQLFloat) );
const StringTypedArrayValueType = genericTypedValueType('StringTypedArrayValue', new GraphQLList(GraphQLString) );
const DateTimeTypedArrayValueType = genericTypedValueType('DateTimeTypedArrayValue', new GraphQLList(GraphQLString) );
const GuidTypedArrayValueType = genericTypedValueType('GuidTypedArrayValue', new GraphQLList(GraphQLString) );
const ByteStringTypedArrayValueType = genericTypedValueType('ByteStringTypedArrayValue', new GraphQLList(GraphQLString) );


const MethodParameterType = new GraphQLObjectType({
  name: 'MethodParameter',
  fields: {
    name: {type: GraphQLString },
    dataType: {type: ExpandedNodeIdType },
    valueRank: {type: GraphQLInt },
    arrayDimensions: {type: new GraphQLList(GraphQLInt)},
    description : {type: LocalizedTextType}

  }
});
const MethodParameterTypedArrayValueType = genericTypedValueType('MethodParameterTypedArrayValue', new GraphQLList(MethodParameterType) );


const typedValue = new GraphQLUnionType({
  name: 'typedValue',
  types: [
        BooleanTypedValueType,
        SByteTypedValueType,
        ByteTypedValueType,
        Int16TypedValueType,
        UInt16TypedValueType,
        Int32TypedValueType,
        UInt32TypedValueType,
        Int64TypedValueType,
        UInt64TypedValueType,
        FloatTypedValueType,
        DoubleTypedValueType,
        StringTypedValueType,
        DateTimeTypedValueType,
        GuidTypedValueType,
        ByteStringTypedValueType,

        BooleanTypedArrayValueType,
        SByteTypedArrayValueType,
        ByteTypedArrayValueType,
        Int16TypedArrayValueType,
        UInt16TypedArrayValueType,
        Int32TypedArrayValueType,
        UInt32TypedArrayValueType,
        Int64TypedArrayValueType,
        UInt64TypedArrayValueType,
        FloatTypedArrayValueType,
        DoubleTypedArrayValueType,
        StringTypedArrayValueType,
        DateTimeTypedArrayValueType,
        GuidTypedArrayValueType,
        ByteStringTypedArrayValueType,
        MethodParameterTypedArrayValueType


        ],
  resolveType(value){
    //console.log("here", value);
    console.log('typing valuejson = ', JSON.stringify(value, null, '\t'));
     if(value.arrayType && value.dataType) {
      if (value.arrayType.toString() === 'Array') {
          switch(value.dataType.toString()){
            case 'Boolean': return BooleanTypedArrayValueType;
            case 'SByte': return SByteTypedArrayValueType;
            case 'Byte': return ByteTypedArrayValueType;
            case 'Int16': return Int16TypedArrayValueType;
            case 'UInt16': return UInt16TypedArrayValueType;
            case 'Int32': return Int32TypedArrayValueType;
            case 'UInt32': return UInt32TypedArrayValueType;
            case 'Int64': return Int64TypedArrayValueType;
            case 'UInt64': return UInt64TypedArrayValueType;
            case 'Float': return FloatTypedArrayValueType;
            case 'Double': return DoubleTypedArrayValueType;
            case 'String': return StringTypedArrayValueType;
            case 'DateTime': return DateTimeTypedArrayValueType;
            case 'Guid': return GuidTypedArrayValueType;
            case 'ByteString': return ByteStringTypedArrayValueType;
            //will be more to it than this ?? extension point?
            case 'ExtensionObject': return MethodParameterTypedArrayValueType;
          }
      }
      else {
        switch(value.dataType.toString()){
            case 'Boolean': return BooleanTypedValueType;
            case 'SByte': return SByteTypedValueType;
            case 'Byte': return ByteTypedValueType;
            case 'Int16': return Int16TypedValueType;
            case 'UInt16': return UInt16TypedValueType;
            case 'Int32': return Int32TypedValueType;
            case 'UInt32': return UInt32TypedValueType;
            case 'Int64': return Int64TypedValueType;
            case 'UInt64': return UInt64TypedValueType;
            case 'Float': return FloatTypedValueType;
            case 'Double': return DoubleTypedValueType;
            case 'String': return StringTypedValueType;
            case 'DateTime': return DateTimeTypedValueType;
            case 'Guid': return GuidTypedValueType;
            case 'ByteString': return ByteStringTypedValueType;
          }
        }
      }
    }
});


const typedArgumentValue = (type, name) => new GraphQLObjectType({
  name: name,
  fields: {
    value: {type: type}
  }
});

const BooleanArgumentValueType = typedArgumentValue(GraphQLBoolean, 'BooleanArgumentValue');
const IntArgumentValueType = typedArgumentValue(GraphQLInt, 'IntArgumentValue');
const Int64ArgumentValueType = typedArgumentValue(new GraphQLList(GraphQLInt), 'Int64ArgumentValue');
const FloatArgumentValueType = typedArgumentValue(GraphQLFloat, 'FloatArgumentValue');
const StringArgumentValueType = typedArgumentValue(GraphQLString, 'StringArgumentValue');

const TypedArgumentValueType = new GraphQLUnionType({
  name: 'TypedArgumentValue',
  types: [
    BooleanArgumentValueType,
    IntArgumentValueType,
    Int64ArgumentValueType,
    FloatArgumentValueType,
    StringArgumentValueType
  ],
  resolveType(value){
    console.log("here", value);
   
    if (value.arrayType.toString() === 'Array') {
        switch(value.dataType.toString()){
          case 'Boolean': return BooleanTypedArrayValueType;
          case 'SByte': return SByteTypedArrayValueType;
          case 'Byte': return ByteTypedArrayValueType;
          case 'Int16': return Int16TypedArrayValueType;
          case 'UInt16': return UInt16TypedArrayValueType;
          case 'Int32': return Int32TypedArrayValueType;
          case 'UInt32': return UInt32TypedArrayValueType;
          case 'Int64': return Int64TypedArrayValueType;
          case 'UInt64': return UInt64TypedArrayValueType;
          case 'Float': return FloatTypedArrayValueType;
          case 'Double': return DoubleTypedArrayValueType;
          case 'String': return StringTypedArrayValueType;
          case 'DateTime': return DateTimeTypedArrayValueType;
          case 'Guid': return GuidTypedArrayValueType;
          case 'ByteString': return ByteStringTypedArrayValueType;
          //will be more to it than this ?? extension point?
          case 'ExtensionObject': return MethodParameterTypedArrayValueType;
        }
    }
    else {
      switch(value.dataType.toString()){
          case 'Boolean': return BooleanArgumentValueType;
          case 'SByte': return IntArgumentValueType;
          case 'Byte': return IntArgumentValueType;
          case 'Int16': return IntArgumentValueType;
          case 'UInt16': return IntArgumentValueType;
          case 'Int32': return IntArgumentValueType;
          case 'UInt32': return IntArgumentValueType;
          case 'Int64': return Int64ArgumentValueType;
          case 'UInt64': return Int64ArgumentValueType;
          case 'Float': return FloatArgumentValueType;
          case 'Double': return FloatArgumentValueType;
          case 'String': return StringArgumentValueType;
          case 'DateTime': return StringArgumentValueType;
          case 'Guid': return StringArgumentValueType;
          case 'ByteString': return StringArgumentValueType;
        }
    }
  }
});

const ArgumentValueType = new GraphQLObjectType({
  name: 'ArgumentValueType',
  fields: {
    dataType: {type: GraphQLString},
    arrayType: {type: GraphQLString},
    value: {type: TypedArgumentValueType}
  }
});


const genericTypedResultType = (type, name)=> new GraphQLObjectType({
  name: name,
  fields: {
    value: {type: type },
    typedValue: {type: typedValue},
    stringValue: {type: GraphQLString },
    jsonValue: {type: GraphQLString },
    statusCode: {type: StatusCodeType },
    serverPicoseconds: {type: GraphQLInt },
    serverTimestamp: {type: GraphQLString }, //needs type
    sourcePicoseconds: {type: GraphQLInt }
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
    Unspecified: {value: 0 },  // No classes are selected.
    Object: {value: 1 },  // The node is an object.
    Variable: {value: 2 },  // The node is a variable.
    Method: {value: 4 },  // The node is a method.
    ObjectType: {value: 8 },  // The node is an object type.
    VariableType: {value: 16 },  // The node is an variable type.
    ReferenceType: {value: 32 },  // The node is a reference type.
    DataType: {value: 64 },  // The node is a data type.
    View: {value: 128 }   // The node is a view.
  }
}), 'NodeClassEnumValue');
const NodeClassEnumResultType = genericResultType(NodeClassEnumValueType, 'NodeClassEnumValueResult');



const IntResultType = genericResultType(genericValueType(GraphQLInt, 'IntValue'), 'IntResult');
const BooleanResultType = genericResultType(genericValueType(GraphQLBoolean, 'BooleanValue'), 'BooleanResult');
const StringResultType = genericResultType(genericValueType(GraphQLString, 'StringValue'), 'StringResult');
const FloatResultType = genericResultType(genericValueType(GraphQLFloat, 'FloatValue'), 'FloatResult');
const IntListResultType = genericResultType(genericValueType(new GraphQLList(GraphQLInt), 'IntListValue'), 'IntListResult');

const DataValueResultType = genericTypedResultType(genericValueType(GraphQLString, 'DataValue'), 'DataValueResult');


const getProperty = (type, attributeId) => ({
  type: type,
  resolve: ({id})=> new Promise(function(resolve, reject){
    console.log('getting propery', id);
    const nodesToRead = [
      {
        nodeId: id,
        attributeId: attributeId
      }
    ];
    uaSession().read(nodesToRead, function(err, _nodesToRead, results) {
      console.log('got back');
        if (!err) {
          const value = results[0].value ? results[0].value.value : null;
          const arrayType = results[0].value ? results[0].value.arrayType : null;
          const dataType = results[0].value ? results[0].value.dataType : null;
          const stringValue = ()=> value !== null && value !== undefined ? value.toString() : null;
          const jsonValue = ()=> JSON.stringify(value);

          const ret = merge(results[0], {typedValue: {value, arrayType, dataType}, stringValue, jsonValue});
          resolve(ret);
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
    dataType: getProperty(ExpandedNodeIdResultType, opcua.AttributeIds.DataType), //14,
    valueRank: getProperty(IntResultType, opcua.AttributeIds.ValueRank), //15,
    arrayDimensions: getProperty(IntListResultType, opcua.AttributeIds.ArrayDimensions), //16,  IntListResultType
    accessLevel: getProperty(IntResultType, opcua.AttributeIds.AccessLevel), //17,
    userAccessLevel: getProperty(IntResultType, opcua.AttributeIds.UserAccessLevel), //18,
    minimumSamplingInterval: getProperty(FloatResultType, opcua.AttributeIds.MinimumSamplingInterval), //19,
    historizing: getProperty(BooleanResultType, opcua.AttributeIds.Historizing), //20,
    executable: getProperty(BooleanResultType, opcua.AttributeIds.Executable), //21,
    userExecutable: getProperty(BooleanResultType, opcua.AttributeIds.UserExecutable), //22,
    outputArguments: {type: new GraphQLList(ArgumentValueType)},
    //prob wrong - can have multiple parents?
    parent: {
      type: ReferenceDescriptionType,
      resolve: ({id}) => new Promise(function(resolve, reject){
        uaSession().browse(id, function(err, browseResult){
          if(!err) {
            resolve(browseResult[0].references
              .filter(r=>!r.isForward)
              .map(r=>{
                r.id = r.nodeId.toString();
                return r;
              })[0]
            );
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
      resolve: ({id}, args) => connectionFromPromisedArray(
        new Promise(function(resolve, reject){
            uaSession().browse(id, function(err, browseResult){
              if(!err) {
                resolve(browseResult[0].references.map(r=>{
                  r.id = r.nodeId.toString();
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
    nodeClass: {type: GraphQLString },
    nodeId: {type: ExpandedNodeIdType }, //??
    referenceTypeId: {type: ExpandedNodeIdType },
    typeDefinition: {type: ExpandedNodeIdType },
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

const getUANode = (nodeId, outputArguments)=> {
  return {
    id: nodeId,
    //these are used when there has been a method call
    outputArguments: outputArguments,
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
    count: {type: GraphQLInt }
  }
});


const UpdateCountMutation = mutationWithClientMutationId({
  name: 'UpdateCount',
  inputFields: {
    //clientMutationId: {type: new GraphQLNonNull(GraphQLID) },
    id: {type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    count: {
      type: CountType,
      resolve: (payload) => {
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
   
  },
});


const CallUAMethodMutation = mutationWithClientMutationId({
  name: 'CallUAMethod',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID) 
    },
    parent: {
      type: new GraphQLNonNull(GraphQLID) 
    },
    //this will be a JSON string - array of variants
    inputParameters: {
      type: GraphQLString, //LocalizedTextType //MethodParameterTypedArrayValueType
    }
  },
  outputFields: {
    uaNode: {
      type: UANodeType,
      resolve: (payload) => {
        return payload;
      },
    }
  },
  mutateAndGetPayload: ({id, parent}) => {
    const methodsToCall = [ {
      objectId: fromGlobalId(parent).id,
      methodId: fromGlobalId(id).id,
      inputArguments: [
        new opcua.Variant(JSON.parse('{"dataType": "Boolean", "value": false}')),
        new opcua.Variant({dataType: opcua.DataType.SByte, value: 10}),
        new opcua.Variant({dataType: opcua.DataType.Byte, value: 9}),
        new opcua.Variant({dataType: opcua.DataType.Int16, value: 8}),
        new opcua.Variant({dataType: opcua.DataType.UInt16, value: 7}),
        new opcua.Variant({dataType: opcua.DataType.Int32, value: 6}),
        new opcua.Variant({dataType: opcua.DataType.UInt32, value: 5}),
        new opcua.Variant({dataType: opcua.DataType.Int64, value: 4}),
        new opcua.Variant({dataType: opcua.DataType.UInt64, value: 3}),
        new opcua.Variant({dataType: opcua.DataType.Float, value: 2}),
        new opcua.Variant({dataType: opcua.DataType.Double, value: 1000}),
      ]    
    }];

    return new Promise(function(resolve, reject){
        try{
          uaSession().call(methodsToCall, function(err, results) {
              if(!err) {
                console.log(JSON.stringify(results, null, '\t'));
                if(results[0].statusCode.value)
                {
                  reject(results[0].statusCode);
                }
                else
                {
                  console.log(results[0].outputArguments[0].dataType);
                  resolve(getUANode(fromGlobalId(id).id, results[0].outputArguments.map(arg=>merge(arg, {value: { value: arg.value, dataType: arg.dataType, arrayType: arg.arrayType}}))));  
                }
                
                
              } else {
                console.log(err);
                reject(err);
              }
            }
          );
        }
        catch(err){
            console.log('errrrr', err);
            reject(err);
        }
        
    });
  },
});


var UpdateUANodeMutation = mutationWithClientMutationId({
  name: 'UpdateUANode',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID) 
    },
    value: {
      type: GraphQLString
    },
    dataType: {
      type: GraphQLString
    }
  },
  outputFields: {
    uaNode: {
      type: UANodeType,
      resolve: (payload) => {
        return payload;
      },
    }
  },
  mutateAndGetPayload: ({id, value, dataType}) => {
    var nodeId = fromGlobalId(id).id;
    console.log('nid', nodeId);
    console.log('value', value);
    console.log('dataType', dataType);
   
    return new Promise(function(resolve, reject){
        console.log('nid!!', nodeId);
        try{
          uaSession().writeSingleNode(nodeId, new opcua.Variant({dataType: dataType, value: value}), (err, statusCode) => 
            {
                if(!err) {
                  console.log('resolving: ', JSON.stringify(statusCode));
                  resolve(getUANode(nodeId));
                } else {
                  console.log(err);
                  reject(err);
                }
              }
            );
        }
        catch(err){
            console.log('errrrr', err);
            reject(err);
        }
        
    });
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
    updateCount: UpdateCountMutation,
    updateUANode: UpdateUANodeMutation,
    callUAMethod: CallUAMethodMutation
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


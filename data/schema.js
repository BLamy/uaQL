'use strict';
console.log("lk-qwsjxbljqwkbhsxdlqwjkbd", 1 << 0, 0 << 2, 0 << 3, 0 << 4);
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
import extend from 'util-extend';
var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'ReferenceDescription') {
      return getReference(id);
    } else
    if (type === 'UANode') {
      return getUANode(id);
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
  }
);


const QualifiedNameType = new GraphQLObjectType({
  name: 'QualifiedName',
  description: 'http://node-opcua.github.io/api_doc/classes/QualifiedName.html',
  fields: {
    namespaceIndex: {
      type: GraphQLInt
    },
    name: {
      type: GraphQLString
    }
  }
});


const LocalizedTextType = new GraphQLObjectType({
  name: 'LocalizedText',
  description: 'http://node-opcua.github.io/api_doc/classes/LocalizedText.html',
  fields: {
    text: {
      type: GraphQLString
    },
    locale: {
      type: GraphQLString
    }
  }
});

const genericTypedValueType = (type, name) => new GraphQLObjectType({
  name: name,
  fields: {
    value: {
      type: type
    }
  }
});


const StatusCodeType = new GraphQLObjectType({
  name: 'StatusCode',
  description: 'http://node-opcua.github.io/api_doc/classes/StatusCode.html',
  fields: {
    value: {
      type: GraphQLInt
    },
    description: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    }
  }
});

const ExpandedNodeIdType = new GraphQLObjectType({
  name: 'ExpandedNodeId',
  description: 'http://node-opcua.github.io/api_doc/classes/ExpandedNodeId.html',
  fields: ()=>({
    identifierType: {
      type: GraphQLString
    },
    value: {
      type: GraphQLString
    }, //needs type
    namespace: {
      type: GraphQLInt
    },
    namespaceUri: {
      type: GraphQLString
    }, //needs type
    serverIndex: {
      type: GraphQLInt
    },
    uaNode: {
      type: UANodeType,
      resolve: getUANode
    }
  })
});

const genericValueType = (type, name)=> new GraphQLObjectType({
  name: name,
  fields: {
    dataType: {
      type: GraphQLString
    },
    arrayType: {
      type: GraphQLString
    },
    value: {
      type: type
    }
  }
});

const genericResultType = (type, name)=> new GraphQLObjectType({
  name: name,
  fields: {
    value: {
      type: type
    },
    stringValue: {
      type: GraphQLString
    },
    jsonValue: {
      type: GraphQLString
    },
    statusCode: {
      type: StatusCodeType
    },
    serverPicoseconds: {
      type: GraphQLInt
    },
    serverTimestamp: {
      type: GraphQLString
    }, //needs type
    sourcePicoseconds: {
      type: GraphQLInt
    }
  }
});

const BooleanTypedValueType = genericTypedValueType(GraphQLBoolean, 'BooleanTypedValue');
const SByteTypedValueType = genericTypedValueType(GraphQLInt, 'SByteTypedValue');
const ByteTypedValueType = genericTypedValueType(GraphQLInt, 'ByteTypedValue');
const Int16TypedValueType = genericTypedValueType(GraphQLInt, 'Int16TypedValue');
const UInt16TypedValueType = genericTypedValueType(GraphQLInt, 'UInt16TypedValue');
const Int32TypedValueType = genericTypedValueType(GraphQLInt, 'Int32TypedValue');
const UInt32TypedValueType = genericTypedValueType(GraphQLInt, 'UInt32TypedValue');
const Int64TypedValueType = genericTypedValueType(GraphQLInt, 'Int64TypedValue');
const UInt64TypedValueType = genericTypedValueType(GraphQLInt, 'UInt64TypedValue');
const FloatTypedValueType = genericTypedValueType(GraphQLFloat, 'FloatTypedValue');
const DoubleTypedValueType = genericTypedValueType(GraphQLFloat, 'DoubleTypedValue');
const StringTypedValueType = genericTypedValueType(GraphQLString, 'StringTypedValue');
const DateTimeTypedValueType = genericTypedValueType(GraphQLString, 'DateTimeTypedValue');
const GuidTypedValueType = genericTypedValueType(GraphQLString, 'GuidTypedValue');
const ByteStringTypedValueType = genericTypedValueType(GraphQLString, 'ByteStringTypedValue');

const BooleanTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLBoolean), 'BooleanTypedArrayValue');
const SByteTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLInt), 'SByteTypedArrayValue');
const ByteTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLInt), 'ByteTypedArrayValue');
const Int16TypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLInt), 'Int16TypedArrayValue');
const UInt16TypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLInt), 'UInt16TypedArrayValue');
const Int32TypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLInt), 'Int32TypedArrayValue');
const UInt32TypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLInt), 'UInt32TypedArrayValue');
const Int64TypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLInt), 'Int64TypedArrayValue');
const UInt64TypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLInt), 'UInt64TypedArrayValue');
const FloatTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLFloat), 'FloatTypedArrayValue');
const DoubleTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLFloat), 'DoubleTypedArrayValue');
const StringTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLString), 'StringTypedArrayValue');
const DateTimeTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLString), 'DateTimeTypedArrayValue' );
const GuidTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLString), 'GuidTypedArrayValue');
const ByteStringTypedArrayValueType = genericTypedValueType(new GraphQLList(GraphQLString), 'ByteStringTypedArrayValue');


const MethodParameterType = new GraphQLObjectType({
  name: 'MethodParameter',
  description: 'Required parameter for a method call',
  fields: {
    name: {
      type: GraphQLString
    },
    dataType: {
      type: ExpandedNodeIdType
    },
    valueRank: {
      type: GraphQLInt
    },
    arrayDimensions: {
      type: new GraphQLList(GraphQLInt)
    },
    description: {
      type: LocalizedTextType
    }
  }
});

const MethodParameterTypedArrayValueType = genericTypedValueType(new GraphQLList(MethodParameterType), 'MethodParameterTypedArrayValue' );

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
    value: {
      type: type
    }
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
    dataType: {
      type: GraphQLString
    },
    arrayType: {
      type: GraphQLString
    },
    value: {
      type: TypedArgumentValueType
    }
  }
});


const genericTypedResultType = (type, name)=> new GraphQLObjectType({
  name: name,
  fields: {
    value: {
      type: type
    },
    typedValue: {
      type: typedValue
    },
    stringValue: {
      type: GraphQLString
    },
    jsonValue: {
      type: GraphQLString
    },
    statusCode: {
      type: StatusCodeType
    },
    serverPicoseconds: {
      type: GraphQLInt
    },
    serverTimestamp: {
      type: GraphQLString
    }, //needs type
    sourcePicoseconds: {
      type: GraphQLInt
    }
  }
});




const QualifiedNameValueType = genericValueType(QualifiedNameType, 'QualifiedNameValue');
const QualifiedNameResultType = genericResultType(QualifiedNameValueType, 'QualifiedNameResult');


const LocalizedTextValueType = genericValueType(LocalizedTextType, 'LocalizedTextValue');
const LocalizedTextResultType = genericResultType(LocalizedTextValueType, 'LocalizedTextResult');


const ExpandedNodeIdValueType = genericValueType(ExpandedNodeIdType, 'ExpandedNodeIdValue');
const ExpandedNodeIdResultType = genericResultType(ExpandedNodeIdValueType, 'ExpandedNodeIdResult');

const ResultMaskEnumType = new GraphQLEnumType({
    name: 'ResultMaskEnum',
    description: 'results required for a reference',
    values: {
      ReferenceType: {
        value: 0x01,
        description: 'Reference type.'
      },
      IsForward: {
        value: 0x02,
        description: 'Is forward.'
      },
      NodeClass: {
        value: 0x04,
        description: 'Node class.'
      },
      BrowseName: {
        value: 0x08,
        description: 'Browse name.'
      },
      DisplayName: {
        value: 0x10,
        description: 'Display name.'
      },
      TypeDefinition: {
        value: 0x20,
        description: 'Type definition.'
      }
    }
});

const BrowseDirectionEnumType = new GraphQLEnumType({
  name: 'BrowseDirectionEnum',
  description: 'Browse direction enumeration.',
  values: {
    Invalid: {
      value: -1,
      description: 'Invalid.'
    },
    Forward: {
      value: 0,
      description: 'Browse forward.'
    },
    Inverse: {
      value: 1,
      description: 'Browse backward.'
    },
    Both: {
      value: 2,
      description: 'Browse forward and backward.'
    }
  }
});


const NodeClassEnumType = new GraphQLEnumType({
  name: 'NodeClassEnum',
  description: 'Node class enumeration',
  values: {
    Unspecified: {
      value: 0,
      description: 'No classes are selected.'
    },
    Object: {
      value: 1,
      description: 'The node is an object.'
    },
    Variable: {
      value: 2,
      description: 'The node is a variable.'
    },
    Method: {
      value: 4,
      description: 'The node is a method.'
    },
    ObjectType: {
      value: 8,
      description: 'The node is an object type.'
    },
    VariableType: {
      value: 16,
      description: 'The node is an variable type.'
    },
    ReferenceType: {
      value: 32,
      description: 'The node is a reference type.'
    },
    DataType: {
      value: 64,
      description: 'The node is a data type.'
    },
    View: {
      value: 128,
      description: 'The node is a view.'
    }
  }
});

const NodeClassEnumValueType = genericValueType(NodeClassEnumType, 'NodeClassEnumValue');

const NodeClassEnumResultType = genericResultType(NodeClassEnumValueType, 'NodeClassEnumValueResult');
const IntResultType = genericResultType(genericValueType(GraphQLInt, 'IntValue'), 'IntResult');
const BooleanResultType = genericResultType(genericValueType(GraphQLBoolean, 'BooleanValue'), 'BooleanResult');
const StringResultType = genericResultType(genericValueType(GraphQLString, 'StringValue'), 'StringResult');
const FloatResultType = genericResultType(genericValueType(GraphQLFloat, 'FloatValue'), 'FloatResult');
const IntListResultType = genericResultType(genericValueType(new GraphQLList(GraphQLInt), 'IntListValue'), 'IntListResult');

const DataValueResultType = genericTypedResultType(genericValueType(GraphQLString, 'DataValue'), 'DataValueResult');


const getProperty = (type, attributeId) => ({
  type: type,
  description: 'DOcument this!',
  resolve: ({id})=> new Promise(function(resolve, reject){
    const nodesToRead = [
      {
        nodeId: id,
        attributeId: attributeId
      }
    ];
    uaSession().read(nodesToRead, function(err, _nodesToRead, results) {
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
  description: 'An OPCUA node',
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
    references: {
      type: ReferenceConnection,
      description: 'references are typed links to other nodes',
      args: extend({
        referenceTypeId: {
          type: GraphQLString,
          description: 'Filter by the reference type.'
        },
        browseDirection: {
          type: BrowseDirectionEnumType,
          description: 'Browse direction.'
        },
        nodeClasses: {
          type: new GraphQLList(NodeClassEnumType),
          description: 'Node classes to include.'
        },
        results: {
          type: new GraphQLList(ResultMaskEnumType),
          description: 'Results to include.'
        },
        includeSubtypes: {
          type: GraphQLBoolean,
          description: 'Include subtypes.'
        }
      }, connectionArgs),
      resolve: ({id}, args) => connectionFromPromisedArray(
        new Promise(function(resolve, reject){
            const {referenceTypeId, browseDirection, nodeClasses, includeSubtypes, results} = args;
            console.log(nodeClasses);
            const browseDescription = {
              nodeId: id,
              referenceTypeId,
              browseDirection: browseDirection || 0,
              includeSubtypes: includeSubtypes,
              nodeClassMask: nodeClasses ? nodeClasses.reduce(((p, c)=>p | c), 0) : 0,
              resultMask: results ? results.reduce(((p, c)=>p | c), 0) : 63
            };
            
            uaSession().browse([browseDescription], function(err, browseResult){
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



const ReferenceDescriptionType = new GraphQLObjectType({
  name: 'ReferenceDescription',
  description: 'http://node-opcua.github.io/api_doc/classes/ReferenceDescription.html',
  fields: ()=>({
    id: globalIdField('ReferenceDescription'),
    browseName: {
      type: QualifiedNameType
    },
    displayName: {
      type: LocalizedTextType
    },
    isForward: {
      type: GraphQLBoolean
    },
    nodeClass: {
      type: GraphQLString
    },
    nodeId: {
      type: ExpandedNodeIdType
    }, //??
    referenceTypeId: {
      type: ExpandedNodeIdType
    },
    typeDefinition: {
      type: ExpandedNodeIdType
    },
    uaNode: {
      type: UANodeType,
      description: 'The UANode that the reference points to',
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
            if(results[0].statusCode.value)
            {
              reject(results[0].statusCode);
            }
            else
            {
              resolve(getUANode(fromGlobalId(id).id, results[0].outputArguments.map(arg=>merge(arg, {value: { value: arg.value, dataType: arg.dataType, arrayType: arg.arrayType}}))));  
            }
            
            
          } else {
            reject(err);
          }
        });
      }
      catch(err){
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

var queryType = new GraphQLObjectType({
  name: 'Query',
  description: 'root graphql query, everything starts from here',
  fields: () => ({
    node: nodeField,
    uaNode: {
      type: UANodeType,
      description: 'Gets a ua node from it\'s nodeId or the root folder',
      args: {
        nodeId: {
          name: 'nodeId',
          description: 'the node id to fetch if blank fetches "RootFolder"',
          type: GraphQLString
        }
      },
      resolve: function (_, {nodeId}) {
        return getUANode(nodeId || 'RootFolder');
      }
    },
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


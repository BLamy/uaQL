// @flow

'use strict';
import graphQL, {
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
  GraphQLUnionType,
  GraphQLInterfaceType,
  GraphQLScalarType
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

import GraphQLDate from 'graphql-custom-datetype';
import {opcua, nextSession, handleError} from './opcua';
import merge from 'merge';
import extend from 'util-extend';
var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'UANode') {
      return getUANode(id);
    }
    else {
      return null;
    }
  },
  (obj) => {
    if(obj.type === 'UANodeType') {
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

//const QualifiedNameArrayType = new GraphQLList(QualifiedNameType);

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


const resolveUaDataType = (value, info) => {
  if (value.arrayType.toString() === 'Array') {
    switch(value.dataType.toString()){
      case 'Boolean': return UaBooleanArray;
      case 'SByte': return UaIntArray;
      case 'Byte': return UaIntArray;
      case 'Int16': return UaIntArray;
      case 'UInt16': return UaIntArray;
      case 'Int32': return UaIntArray;
      case 'UInt32': return UaLongArray;
      case 'Int64': return Int64TypedArrayValueType;
      case 'UInt64': return UInt64TypedArrayValueType;
      case 'Float': return UaFloatArray;
      case 'Double': return UaFloatArray;
      case 'String': return UaStringArray;
      case 'DateTime': return UaDateArray;
      case 'Guid': return UaStringArray;
      case 'ByteString': return ByteStringTypedArrayValueType;

      //will be more to it than this ?? extension point?
      case 'ExtensionObject': return MethodParameterTypedArrayValueType;
     case 'QualifiedName': return UaQualifiedNameArray;
    }
  } else {
    switch(value.dataType.toString()){
      case 'Boolean': return UaBoolean;
      case 'SByte': return UaInt;
      case 'Byte': return UaInt;
      case 'Int16': return UaInt;
      case 'UInt16': return UaInt;
      case 'Int32': return UaInt;
      case 'UInt32': return UaLong;
      case 'Int64': return Int64TypedValueType;
      case 'UInt64': return UInt64TypedValueType;
      case 'Float': return UaFloat;
      case 'Double': return UaFloat;
      case 'String': return UaString;
      case 'DateTime': return UaDate;
      case 'Guid': return UaString;
      case 'ByteString': return ByteStringTypedValueType;
      case 'QualifiedName': return UaQualifiedName;
    }
  }
};

const IUaDataValue = new GraphQLInterfaceType({
  name: 'IUaDataValue',
  fields : {
    dataType: {
      type: GraphQLString
    },
    arrayType : {
      type: GraphQLString
    }
  },
  description:'Data type and array type for data values',
  resolveType: resolveUaDataType
});


const genericValueType = (type, name, arrayType, [dataTypes], description)=> new GraphQLObjectType({
  name: name,
  description: description,
  interfaces: [IUaDataValue],
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
  },
  istypeof: value => value.arrayType=== arrayType && dataTypes.indexOf(value.dataType) > -1
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
    MethodParameterTypedArrayValueType,
    QualifiedNameType,
//    QualifiedNameArrayType
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
  //          case 'QualifiedName': return QualifiedNameArrayType;
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
            case 'QualifiedName': return QualifiedNameType;
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
    index: {
      type: GraphQLInt
    },
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



const getProperty = (type, attributeId, description) => ({
  type: type,
  description: description,
  resolve: ({id})=> new Promise(function(resolve, reject){
    const nodesToRead = [
      {
        nodeId: id,
        attributeId: attributeId
      }
    ];
    nextSession().take(1).timeout(3000, new Error('Timeout, try later.')).subscribe(session=>
      session.read(nodesToRead, function(err, _nodesToRead, results) {
        if (!err) {
          if(!results[0].statusCode.value) {
            resolve(results[0].value ? results[0].value.value : null);
          } else {
            reject(results[0].statusCode);
          }
        } else {
          reject(handleError(session, err));
        }
      }),
      reject
    );
  })
});

const getWholeProperty = (type, attributeId, description) => ({
  type: type,
  description: description,
  resolve: ({id})=> new Promise(function(resolve, reject){
    const nodesToRead = [
      {
        nodeId: id,
        attributeId: attributeId
      }
    ];
    nextSession().take(1).timeout(3000, new Error('Timeout, try later.')).subscribe(session=>
      session.read(nodesToRead, function(err, _nodesToRead, results) {
        if (!err) {
          if(!results[0].statusCode.value) {
            if(results[0].value.arrayType.toString()=== 'Array')
            {
              let arr=[];
              for(let x of Object.keys(results[0].value.value))
              {
                arr[Number(x)]= results[0].value.value[x];
              }
              results[0].value.value = arr;
            }
            resolve(results[0].value);
          } else {
            reject(results[0].statusCode);
          }
        } else {
          reject(handleError(session, err));
        }
      }),
      reject
    );
  })
});

/*

Null:              0,
        Boolean:           1,
        SByte:             2, // signed Byte = Int8
        Byte :             3, // unsigned Byte = UInt8
        Int16:             4,
        UInt16:            5,
        Int32:             6,
        UInt32:            7,
        Int64:             8,
        UInt64:            9,
        Float:            10,
        Double:           11,
        String:           12,
        DateTime:         13,
        Guid:             14,
        ByteString:       15,
        XmlElement:       16,
        NodeId:           17,
        ExpandedNodeId:   18,
        StatusCode:       19,
        QualifiedName:    20,
        LocalizedText:    21,
        ExtensionObject:  22,
        DataValue:        23,
        Variant:          24,
        DiagnosticInfo:   25

        */


var GraphQLLong = new GraphQLScalarType({
  name: 'GraphQLLong',
  description: '64-bit integral numbers',
  // TODO: Number is only 52-bit
  serialize: Number,
  parseValue: Number,
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind === graphQL.Kind.INT) {
      const num = parseInt(ast.value, 10);
      return num;
    }
    return null;
  }
});

const UaLong = genericValueType(GraphQLLong, 'UaLong', 'Scalar', ['UInt32']);
const UaLongArray = genericValueType(new GraphQLList(GraphQLLong), 'UaLongArray', 'Array', ['UInt32'], 'Long array.');

const UaQualifiedName = genericValueType(QualifiedNameType, 'UaQualifiedName', 'Scalar', ['QualifiedName']);
const UaQualifiedNameArray = genericValueType(new GraphQLList(QualifiedNameType), 'UaQualifiedNameArray', 'Array', ['QualifiedName'], 'String array.');

const UaString = genericValueType(GraphQLString, 'UaString', 'Scalar', ['String', 'Guid']);
const UaStringArray = genericValueType(new GraphQLList(GraphQLString), 'UaStringArray', 'Array', ['String', 'Guid'], 'String array.');


const UaBoolean = genericValueType(GraphQLBoolean, 'UaBoolean', 'Scalar', ['Boolean']);
const UaBooleanArray = genericValueType(new GraphQLList(GraphQLBoolean), 'UaBooleanArray', 'Array', ['Boolean'], 'Boolean array.');

const UaFloat = genericValueType(GraphQLFloat, 'UaFloat', 'Scalar', ['Float', 'Double'], 'Floating point.');
const UaFloatArray = genericValueType(new GraphQLList(GraphQLFloat), 'UaFloatArray', 'Array', ['Float', 'Double'], 'Floating point array.');
const UaInt = genericValueType(GraphQLInt, 'UaInt', 'Scalar', ['SByte', 'Byte', 'Int16', 'UInt16', 'Int32']);
const UaIntArray = genericValueType(new GraphQLList(GraphQLInt), 'UaIntArray', 'Array', ['SByte', 'Byte', 'Int16', 'UInt16', 'Int32'], 'Integer array.');
const UaDate = genericValueType(GraphQLDate, 'UaDate', 'Scalar', ['DateTime']);
const UaDateArray = genericValueType(new GraphQLList(GraphQLDate), 'UaDateArray', 'Array', ['DateTime'], 'Date array.');
const TestUnion = new GraphQLUnionType({
  name: 'TestUnion',
  description: 'type of data value',
  interfaces: [IUaDataValue],
  types: [
    UaLong,
    UaFloat,
    UaInt,
    UaDate,
    UaBoolean,
    UaString,
    UaQualifiedName,
    UaLongArray,
    UaFloatArray,
    UaIntArray,
    UaDateArray,
    UaBooleanArray,
    UaStringArray,
    UaQualifiedNameArray
  ],
  resolveType: resolveUaDataType
});


//  http://node-opcua.github.io/api_doc/classes/ReferenceDescription.html
const UANodeType = new GraphQLObjectType({
  name: 'UANode',
  description: 'An OPCUA node',
  fields: ()=>({
    id: globalIdField('UANode'),
    nodeId: getProperty(ExpandedNodeIdType, opcua.AttributeIds.NodeId, 'Node id.'), //19,
    nodeClass: getProperty(NodeClassEnumType, opcua.AttributeIds.NodeClass, 'Node class.'), //19,
    browseName: getProperty(QualifiedNameType, opcua.AttributeIds.BrowseName, 'Browse name.'), //3
    displayName: getProperty(LocalizedTextType, opcua.AttributeIds.DisplayName, 'Display name.'), //4
    description: getProperty(LocalizedTextType, opcua.AttributeIds.Description, 'Description.'), //5,
    writeMask: getProperty(GraphQLInt, opcua.AttributeIds.WriteMask, 'Write mask.'), //6,
    userWriteMask: getProperty(GraphQLInt, opcua.AttributeIds.UserWriteMask, 'User write mask.'), //7,
    isAbstract: getProperty(GraphQLBoolean, opcua.AttributeIds.IsAbstract), //8,
    symmetric: getProperty(GraphQLBoolean, opcua.AttributeIds.Symmetric), //9,
    inverseName: getProperty(LocalizedTextType, opcua.AttributeIds.InverseName), //5,
    containsNoLoops: getProperty(GraphQLBoolean, opcua.AttributeIds.ContainsNoLoops), //11,
    eventNotifier: getProperty(GraphQLInt, opcua.AttributeIds.EventNotifier), //12,
    dataValue: getWholeProperty(TestUnion, opcua.AttributeIds.DataValue), //13,
    dataType: getProperty(ExpandedNodeIdType, opcua.AttributeIds.DataType), //14,
    valueRank: getProperty(GraphQLInt, opcua.AttributeIds.ValueRank), //15,
    arrayDimensions: getProperty(new GraphQLList(GraphQLInt), opcua.AttributeIds.ArrayDimensions), //16,  IntListResultType
    accessLevel: getProperty(GraphQLInt, opcua.AttributeIds.AccessLevel), //17,
    userAccessLevel: getProperty(GraphQLInt, opcua.AttributeIds.UserAccessLevel), //18,
    minimumSamplingInterval: getProperty(GraphQLFloat, opcua.AttributeIds.MinimumSamplingInterval), //19,
    historizing: getProperty(GraphQLBoolean, opcua.AttributeIds.Historizing), //20,
    executable: getProperty(GraphQLBoolean, opcua.AttributeIds.Executable), //21,
    userExecutable: getProperty(GraphQLBoolean, opcua.AttributeIds.UserExecutable), //22,
    
    outputArguments: {type: new GraphQLList(ArgumentValueType)},
    browsePath: {
      type: UANodeType,
      args: {
        paths: {
          type: new GraphQLList(GraphQLString),
          defaultValue: []
        },
        types: {
          type: new GraphQLList(GraphQLString),
          defaultValue: []
        },
        subTypes: {
          type: new GraphQLList(GraphQLBoolean),
          defaultValue: []
        },
        isInverses: {
          type: new GraphQLList(GraphQLBoolean),
          defaultValue: []
        },
      },
      resolve:({id}, args)=> new Promise(function(resolve, reject){
        nextSession().take(1).timeout(3000, new Error('Timeout, try later...')).subscribe(session=> {
          console.log('resolving');
          const bpath= [{
            startingNode: id,
            relativePath: { 
              elements: args.paths.map((p,i)=>({
                targetName: {
                  namespaceIndex: p.split(':')[1] || 0,
                  name: p.split(':')[0]
                },
                referenceTypeId: args.types[i],
                isInverse: !!args.isInverses[i],
                includeSubtypes: true //!!args.subTypes[i],
              }))
            }
          }];
          console.log('resolving go!', JSON.stringify(bpath, null, '\t'));
          try{
            session.translateBrowsePath(bpath, (err, x) => {
              console.log('aaaa', JSON.stringify(x, null, '\t'));
              if(x[0]) {
                if(x[0].targets) {
                  if(x[0].targets[0])
                    resolve(getUANode(x[0].targets[0].targetId))
                    return;
                }
              }
              resolve(null)
            });
          } catch (ex) {
            console.log(ex);
          }
          console.log('resolved go!', JSON.stringify(bpath, null, '\t'));
        }, reject);
      })
    },
    references: {
      type: ReferenceConnection,
      description: 'References are typed links to other nodes (defaults to forward)',
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
            const browseDescription = {
              nodeId: id,
              referenceTypeId,
              browseDirection: browseDirection || 0,
              includeSubtypes: includeSubtypes,
              nodeClassMask: nodeClasses ? nodeClasses.reduce(((p, c)=>p | c), 0) : 0,
              resultMask: results ? results.reduce(((p, c)=>p | c), 0) : 63
            };
            nextSession().take(1).timeout(3000, new Error('Timeout, try later...')).subscribe(session=> {
                session.browse([browseDescription], function(err, browseResult){
                  if(!err) {
                    resolve(browseResult[0].references.map(r=>{
                      r.id = r.referenceTypeId.toString() + '+' + r.nodeId.toString();
                      return r;
                    }));
                  }
                  else {
                    reject(handleError(session, err));
                  }
                });
                const bpath= [{
                  startingNode: 'ns=0;i=84',
                  relativePath: { 
                    elements: [ {
                        "referenceTypeId":  "ns=0;i=35", //opcua.makeExpandedNodeId(35,0),
                        targetName: {
                          'namespaceIndex': 0,
                          'name': 'Objects'
                        },
                        isInverse: false,
                        includeSubtypes: true,
                      }]
                    }
                }]
              },
              reject
            );
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
        nextSession().take(1).timeout(3000, new Error('Timeout, try later....')).subscribe(session=>
          session.call(methodsToCall, function(err, results) {
            if(!err) {
              if(results[0].statusCode.value)
              {
                reject(results[0].statusCode);
              }
              else
              {
                resolve(getUANode(fromGlobalId(id).id, results[0].outputArguments.map((arg, i)=>{
                  return merge(arg, {index:i, value: { value: arg.value, dataType: arg.dataType, arrayType: arg.arrayType}});
                })));  
              }
            } else {
              reject(handleError(session, err));
            }
          }),
          reject
        );
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
    return new Promise(function(resolve, reject){
        try{
          nextSession().take(1).timeout(3000).subscribe(session=>
            session.writeSingleNode(nodeId, new opcua.Variant({dataType: dataType, value: value}), (err, statusCode) => 
              {
                  if(!err) {
                    resolve(getUANode(nodeId));
                  } else {
                    reject(handleError(session, err));
                  }
                }
              ),
            reject
            );
        }
        catch(err){
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
        namespace: {
          name: 'namespace',
          description: 'the namespace to fetch if blank fetches "RootFolder"',
          type: GraphQLInt
        },
        value: {
          name: 'value',
          description: 'the value to fetch if blank fetches "RootFolder"',
          type: GraphQLString
        },
        identifierType: {
          name: 'identifierType',
          description: 'the identifierType to fetch if blank fetches "RootFolder"',
          type: GraphQLString
        },
        nodeId: {
          name: 'nodeId',
          description: 'the node id to fetch if blank fetches "RootFolder"',
          type: GraphQLString
        }
      },
      resolve: function (_, {nodeId, value, identifierType, namespace}) {

        if(nodeId)
          return getUANode(nodeId );
        if(value && identifierType && (namespace || namespace===0)) {
          return getUANode(`ns=${namespace};${identifierType}=${value}`);
        }
        return getUANode('RootFolder');

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


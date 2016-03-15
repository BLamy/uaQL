'use strict';

import merge from 'merge';
import {
    GraphQLBoolean,
    //GraphQLFloat,
    //GraphQLID,
    GraphQLInt,
    GraphQLList,
    //GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLUnionType
} from 'graphql';



import session from './opcua';





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
  name: 'DataValueType',
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





//  http://node-opcua.github.io/api_doc/classes/ReferenceDescription.html
const ReferenceDescriptionType = new GraphQLObjectType({
  name: 'ReferenceDescription',
  fields: ()=>({
        browseName: {type: QualifiedNameType},
        displayName: {type: LocalizedTextType},
        isForward: {type: GraphQLBoolean},
        nodeClass: { type: GraphQLString },
        nodeId: { type: GraphQLString }, //??
        referenceTypeId: { type: GraphQLString },
        typeDefinition: { type: GraphQLString }, //??
        value: {
            type: DataValueType,
            resolve: (reference) =>new Promise(function(resolve, reject){
                session().readVariableValue(reference.nodeId, function(err, dataValue) {
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
          type: new GraphQLList(ReferenceDescriptionType),
            resolve: (reference) => {
              return new Promise(function(resolve, reject){
                session().browse(reference.nodeId, function(err, browseResult){
                  if(!err) {
                    resolve(browseResult[0].references);
                  }
                  else {
                    reject(err);
                  }
                });
              });
            }
        }
    })
});

const BrowseTargetType = new GraphQLObjectType({
  name: 'BrowseTarget',
  fields: ()=>({
        nodeId: { type: GraphQLString }, //??
        references: {type: new GraphQLList(ReferenceDescriptionType)}
    })
});


// Define our schema, with one top level field, named `user`, that
// takes an `id` argument and returns the User with that ID.
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: BrowseTargetType,
        args: {
          nodeId: { type: GraphQLString },
        },
        resolve: function (_, args) {
          return new Promise(function(resolve, reject){
               session().browse(args.nodeId, function(err, browseResult){
                if(!err) {
                    console.log(JSON.stringify(browseResult, null, '\t'));
                    resolve({
                      nodeId: args.nodeId,
                      references: browseResult[0].references
                    });
                }
                else {
                  reject(err);
                }
              });

          });
        }
      }
    }
  })
});

export {schema as default};



# GraphQL schema for OPC UA

uses https://github.com/node-opcua/node-opcua to expose an opc ua server as a graphQL schema


## demo

[here](https://ua-ql.herokuapp.com/ns=5;i=1/mimic "demo")

(if it says application error it's probably because I am too stingy to pay for it so it switches off 6 hours a day..)


## browsing..

opc.tcp://opcua.demo-this.com:51210/UA/SampleServer

## query..
````
{
  uaNode(nodeId: "ns=2;i=10300") {
    id
    dataValue {
      __typename
      ... on IUaDataValue {
        dataType
        arrayType
        ... on UaFloat {
          value
        }
        ... on UaInt {
          value
        }
        ... on UaDate {
          value
        }
        ... on UaBoolean {
          value
        }
        ... on UaString {
          value
        }
        ... on UaFloatArray {
          value
        }
        ... on UaIntArray {
          value
        }
        ... on UaDateArray {
          value
        }
        ... on UaBooleanArray {
          value
        }
        ... on UaStringArray {
          value
        }
      }
    }
    dataType {
      uaNode {
        nodeClass
        displayName {
          text
        }
      }
      identifierType
      value
      namespace
      namespaceUri
      serverIndex
    }
  }
}

````
## result..

````
{
  "data": {
    "uaNode": {
      "id": "VUFOb2RlOm5zPTI7aT0xMDMwMA==",
      "dataValue": {
        "__typename": "UaBooleanArray",
        "dataType": "Boolean",
        "arrayType": "Array",
        "value": [
          true,
          true,
          true,
          true,
          true,
          false,
          true,
          true,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true,
          true,
          true,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false
        ]
      },
      "dataType": {
        "uaNode": {
          "nodeClass": "DataType",
          "displayName": {
            "text": "Boolean"
          }
        },
        "identifierType": "NUMERIC",
        "value": "1",
        "namespace": 0,
        "namespaceUri": null,
        "serverIndex": null
      }
    }
  }
}
````

# GraphQL server for OPC UA

````
{uaNode(nodeId:"ns=2;i=10757") {
  id
  references(first:10) {
    edges {
      node {
        id
        browseName {
          namespaceIndex
          name
        }
      }
    }
  }
  outputArguments {
    dataType
    arrayType
    value {
        ... on BooleanArgumentValue {value}  
    }  
  }
  dataType {
   value {
     dataType
     arrayType
    value {
      identifierType
      value
      namespace
      namespaceUri
      serverIndex
    }
   }
  }
  dataValue {
    ...giles
  }
  
}}

fragment giles on DataValueResult {
  jsonValue
    typedValue {
        ... on BooleanTypedValue {value}
        ... on MethodParameterTypedArrayValue {value {
          name
          arrayDimensions
          dataType {
            identifierType
            value
            namespace
            namespaceUri
            serverIndex
            node {
              id
              displayName {
                stringValue
                jsonValue
                serverPicoseconds
                serverTimestamp
                sourcePicoseconds
              }
            }
          } 
          valueRank
        }}
      
    }
}
````

````
{
  "data": {
    "uaNode": {
      "id": "VUFOb2RlOm5zPTI7aT0xMDc1Nw==",
      "references": {
        "edges": [
          {
            "node": {
              "id": "UmVmZXJlbmNlRGVzY3JpcHRpb246bnM9MDtpPTY4",
              "browseName": {
                "namespaceIndex": 0,
                "name": "PropertyType"
              }
            }
          },
          {
            "node": {
              "id": "UmVmZXJlbmNlRGVzY3JpcHRpb246bnM9MjtpPTEwNzU2",
              "browseName": {
                "namespaceIndex": 2,
                "name": "ScalarMethod1"
              }
            }
          }
        ]
      },
      "outputArguments": null,
      "dataType": {
        "value": {
          "dataType": "NodeId",
          "arrayType": "Scalar",
          "value": {
            "identifierType": "NUMERIC",
            "value": "296",
            "namespace": 0,
            "namespaceUri": null,
            "serverIndex": null
          }
        }
      },
      "dataValue": {
        "jsonValue": "[{\"name\":\"BooleanIn\",\"dataType\":\"ns=0;i=1\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"SByteIn\",\"dataType\":\"ns=0;i=2\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"ByteIn\",\"dataType\":\"ns=0;i=3\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"Int16In\",\"dataType\":\"ns=0;i=4\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"UInt16In\",\"dataType\":\"ns=0;i=5\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"Int32In\",\"dataType\":\"ns=0;i=6\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"UInt32In\",\"dataType\":\"ns=0;i=7\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"Int64In\",\"dataType\":\"ns=0;i=8\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"UInt64In\",\"dataType\":\"ns=0;i=9\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"FloatIn\",\"dataType\":\"ns=0;i=10\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}},{\"name\":\"DoubleIn\",\"dataType\":\"ns=0;i=11\",\"valueRank\":-1,\"arrayDimensions\":[],\"description\":{}}]",
        "typedValue": {
          "value": [
            {
              "name": "BooleanIn",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "1",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT0x",
                  "displayName": {
                    "stringValue": "locale=null text=Boolean",
                    "jsonValue": "{\"text\":\"Boolean\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "SByteIn",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "2",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT0y",
                  "displayName": {
                    "stringValue": "locale=null text=SByte",
                    "jsonValue": "{\"text\":\"SByte\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "ByteIn",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "3",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT0z",
                  "displayName": {
                    "stringValue": "locale=null text=Byte",
                    "jsonValue": "{\"text\":\"Byte\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "Int16In",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "4",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT00",
                  "displayName": {
                    "stringValue": "locale=null text=Int16",
                    "jsonValue": "{\"text\":\"Int16\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "UInt16In",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "5",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT01",
                  "displayName": {
                    "stringValue": "locale=null text=UInt16",
                    "jsonValue": "{\"text\":\"UInt16\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "Int32In",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "6",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT02",
                  "displayName": {
                    "stringValue": "locale=null text=Int32",
                    "jsonValue": "{\"text\":\"Int32\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "UInt32In",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "7",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT03",
                  "displayName": {
                    "stringValue": "locale=null text=UInt32",
                    "jsonValue": "{\"text\":\"UInt32\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "Int64In",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "8",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT04",
                  "displayName": {
                    "stringValue": "locale=null text=Int64",
                    "jsonValue": "{\"text\":\"Int64\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "UInt64In",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "9",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT05",
                  "displayName": {
                    "stringValue": "locale=null text=UInt64",
                    "jsonValue": "{\"text\":\"UInt64\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "FloatIn",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "10",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT0xMA==",
                  "displayName": {
                    "stringValue": "locale=null text=Float",
                    "jsonValue": "{\"text\":\"Float\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            },
            {
              "name": "DoubleIn",
              "arrayDimensions": [],
              "dataType": {
                "identifierType": "NUMERIC",
                "value": "11",
                "namespace": 0,
                "namespaceUri": null,
                "serverIndex": null,
                "node": {
                  "id": "VUFOb2RlOm5zPTA7aT0xMQ==",
                  "displayName": {
                    "stringValue": "locale=null text=Double",
                    "jsonValue": "{\"text\":\"Double\"}",
                    "serverPicoseconds": 0,
                    "serverTimestamp": "Thu Mar 17 2016 19:21:25 GMT+0000 (GMT Standard Time)",
                    "sourcePicoseconds": 0
                  }
                }
              },
              "valueRank": -1
            }
          ]
        }
      }
    }
  }
}

````
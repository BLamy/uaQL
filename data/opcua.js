'use strict';
import opcua from 'node-opcua';
import async from 'async';
const client = new opcua.OPCUAClient();


const endpointUrl = 'opc.tcp://opcua.demo-this.com:51210/UA/SampleServer';

//opc.tcp://opcserver.mAutomation.net:4841  mFactor Engineering
//opc.tcp://commsvr.com:51234/UA/CAS_UA_Server  CommServer
//opc.tcp://uademo.prosysopc.com:53530/OPCUA/ prosys OPC
//opc.tcp://opcua.demo-this.com:51210/UA/SampleServer opclabs
//opc.tcp://opcua.demo-this.com:51211/UA/SampleServer opclabs
//opc.tcp://opcua.demo-this.com:51212/UA/SampleServer opclabs
//opc.tcp://demo.ascolab.com:4841

var session;

console.log(JSON.parse(JSON.stringify(new opcua.Variant({name: 'yay', dataType: opcua.DataType.UInt32, value: 10}))));

// this is largely bollocks
async.series([

    // step 1 : connect to
    function(callback) {
        client.connect(endpointUrl, function (err) {
          if(err) {
              console.log(' cannot connect to endpoint :', endpointUrl );
          } else {
              console.log('connected !');
          }
          callback(err);
        });
    }

    ,

    // step 2 : createSession
    function(callback) {
        client.createSession( function(err, _session) {
            if(!err) {
                session = _session;
            }
        callback(err);
        });
    },





    // step 3.0 : browse
    function(callback) {

      var browseDescription = {
         nodeId: "ns=0;i=84",
         referenceTypeId: "ns=0;i=35",
         browseDirection: 2
      };


       session.browse(browseDescription, function(err, browseResult){
        if(!err) {
            //console.log(" with browse desciptipon::", JSON.stringify(browseResult, null, '\t'));
            
        }
    callback(err);
        });
    },


    // step 3 : browse
    function(callback) {
       session.browse('ns=0;i=85', function(err, browseResult){
        if(!err) {
            //console.log( JSON.stringify(browseResult, null, '\t'));
            
        }
    callback(err);
        });
    },


/*
    // step 4 : read a variable with readVariableValue
    function(callback) {
      session.readVariableValue('ns=2;i=10845', function(err, dataValue) {
      if (!err) {
          //console.log(' free mem % = ', dataValue.toString());
      }
          callback(err);
      });
    },

    // step 4' : read a variable with read
    function(callback) {
        var nodesToRead = [
            {
                 nodeId: 'ns=0;i=84',
                 attributeId: opcua.AttributeIds.BrowseName
            }
        ];
        session.read(nodesToRead, function(err, _nodesToRead, results) {
            if (!err) {
                console.log(' bname atts = ', JSON.stringify(results[0]));
                console.log(' bname atts = ', results[0]);
            }
           callback(err);
        });
               
    },


// step 4.5' : read a variable with read
    function(callback) {
        session.readAllAttributes(['ns=0;i=84'], function(err, results) {

            if (!err) {
                console.log(' all atts = ', results[0]);
            }
           callback(err);
        } );
               
    },

*/

function(callback) {
      session.readVariableValue('ns=2;i=10845', function(err, dataValue) {
      if (!err) {
          //console.log(' free mem % = ', dataValue.toString());
      }
          callback(err);
      });
    },


function(callback) {

  var methodsToCall = [ {
      objectId: 'ns=4;i=1287',
      methodId: 'ns=4;i=1343'      
  }];


  session.call(methodsToCall, function(err, results) {
      if (!err) {
          console.log('call success!', JSON.stringify(results, null, '\t'));          
      }
     callback(err);
  } );
               
},





  function(callback) {
        session.readAllAttributes(['ns=2;i=10756'], function(err, nodestoread, results) {

            if (!err) {
               /* nodestoread.forEach((node, i)=>{
                    console.log(JSON.stringify({
                      attribute: opcua.AttributeNameById[node.attributeId],
                      node: node,
                      result: results[i]}, null, '\t'));
                });*/
                
            }
           callback(err);
        } );
               
    },

  function(callback) {
        var nodesToRead = [
            {
                 nodeId: 'ns=0;i=84',
                 attributeId: opcua.AttributeIds.NodeClass
            }
        ];
        session.read(nodesToRead, function(err, _nodesToRead, results) {
            if (!err) {
                console.log(' browsename atts = ', JSON.stringify(results[0], null, '\t'));
            }
           callback(err);
        });
               
    },


  function(callback) {
        var nodesToRead = [
            {
                 nodeId: 'ns=0;i=84',
                 attributeId: opcua.AttributeIds.DisplayName
            }
        ];
        session.read(nodesToRead, function(err, _nodesToRead, results) {
            if (!err) {
                console.log(' displayname atts = ', JSON.stringify(results[0]));
                console.log(' dname atts = ', results[0]);
            }
           callback(err);
        });
               
    },



    // step 5: install a subscription and install a monitored item for 10 seconds
    function(callback) {
       const subscription = new opcua.ClientSubscription(session, {
          requestedPublishingInterval: 1000,
          requestedLifetimeCount: 10,
          requestedMaxKeepAliveCount: 2,
          maxNotificationsPerPublish: 10,
          publishingEnabled: true,
          priority: 10
      });

      subscription.on('started', function(){
          console.log('subscription started for 2 seconds - subscriptionId=', subscription.subscriptionId);
      }).on('keepalive', function(){
          //console.log('keepalive');
      }).on('terminated', function(){
          callback();
      });

      setTimeout(function(){
          //subscription.terminate();
      }, 2000000);

      // install monitored item
      var monitoredItem = subscription.monitor({
          nodeId: opcua.resolveNodeId('ns=2;i=10844'),
          attributeId: opcua.AttributeIds.Value
      },
      {
          samplingInterval: 100,
          discardOldest: true,
          queueSize: 10
      },
      opcua.read_service.TimestampsToReturn.Both
      );
      console.log('-------------------------------------');

      monitoredItem.on('changed', function(){
         //console.log(' % free mem = ',dataValue.value.value);
      });
    }
/*
    // close session
    function(callback) {
        _'closing session'
    }
*/
],
function(err) {
    if (err) {
        console.log(' failure ', err);
    } else {
        console.log('done!');
    }
    client.disconnect(function(){});
});



export default function(){ return session; }
export {opcua as opcua}

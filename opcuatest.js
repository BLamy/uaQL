

var opcua = require("node-opcua");
var async = require("async");

var client = new opcua.OPCUAClient();

var endpointUrl ='opc.tcp://opcua.demo-this.com:51210/UA/SampleServer';
var the_subscription = null;
var the_session = null;


function testMonitor(id){
    
    var monitoredItem  = the_subscription.monitor({
            nodeId: opcua.resolveNodeId(id),
            attributeId: 13
          //, dataEncoding: { namespaceIndex: 0, name:null }
        },
        { 
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 10 
        });
        console.log("-------------------------------------");

        // subscription.on("item_added",function(monitoredItem){
        //xx monitoredItem.on("initialized",function(){ });
        //xx monitoredItem.on("terminated",function(value){ });
        

        monitoredItem.on("changed",function(value){
           console.log(id, " New Value = ",value.toString());
        });

}

async.series([


    // step 1 : connect to
    function(callback)  {

        client.connect(endpointUrl,function (err) {

            if(err) {
                console.log(" cannot connect to endpoint :" , endpointUrl );
            } else {
                console.log("connected !");
            }
            callback(err);
        });
    },
    // step 2 : createSession
    function(callback) {
        client.createSession( function(err,session) {
            if(!err) {
                the_session = session;
            }
            callback(err);
        });

    },
   
    // step 5: install a subscription and monitored item
    //
    // -----------------------------------------
    // create subscription
    function(callback) {

        the_subscription=new opcua.ClientSubscription(the_session,{
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 10,
            requestedMaxKeepAliveCount: 2,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });
        the_subscription.on("started",function(){
            console.log("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
        }).on("keepalive",function(){
            console.log("keepalive");
        }).on("terminated",function(){
            callback();
        });
        setTimeout(function(){
            //the_subscription.terminate();
        },10000);
        
        testMonitor("ns=5;i=1");
        testMonitor("ns=5;i=2");
        testMonitor("ns=5;i=3");
        testMonitor("ns=5;i=4");
        testMonitor("ns=5;i=5");
        testMonitor("ns=5;i=6");
        testMonitor("ns=5;i=7");
        testMonitor("ns=5;i=8");
        testMonitor("ns=5;i=9");
        testMonitor("ns=5;i=10");
        testMonitor("ns=5;i=11");
        testMonitor("ns=5;i=12");
        testMonitor("ns=5;i=13");
        testMonitor("ns=5;i=14");
        testMonitor("ns=5;i=15");
        testMonitor("ns=5;i=16");
        testMonitor("ns=5;i=17");
        testMonitor("ns=5;i=18");
        
    },

    // ------------------------------------------------
    // closing session
    //
    function(callback) {
        console.log(" closing session");
        the_session.close(function(err){

            console.log(" session closed");
            callback();
        });
    },


],
    function(err) {
        if (err) {
            console.log(" failure ",err);
        } else {
            console.log("done!")
        }
        client.disconnect(function(){});
    }) ;

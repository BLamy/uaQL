import opcua from 'node-opcua';
import Rx from 'rx';

const endpointUrl = 'opc.tcp://opcua.demo-this.com:51210/UA/SampleServer';



function logAllEmitterEvents(eventEmitter)
{
    var emitToLog = eventEmitter.emit;

    eventEmitter.emit = function () {
        var event = arguments[0];
        if(event!='receive_response' && event!='receive_chunk' && event!='send_request' && event!='send_chunk')
          console.log("event emitted: " + event);
        emitToLog.apply(eventEmitter, arguments);
    };
}
var observable = new Rx.ReplaySubject(1);
var closeRequest = new Rx.Subject();

var client = new opcua.OPCUAClient({applicationName: 'uaQL'});
logAllEmitterEvents(client);
const nodesToRead = [
    {
      nodeId: 'ns=2;i=10756',
      attributeId: 1
    }
  ];


//logAllEmitterEvents(client);
console.log('connecting..');
const read = (client, times) => {
  setTimeout(()=>{
    console.log('-');
    observable.where(s=>s).take(1).subscribe(session=>{
      console.log('.');
      session.read(nodesToRead, function(err, _nodesToRead, results) { 
        if(!err){
          if(times===1){
            console.log(new Date().getSeconds());
          }
          if(times >= 10){//
            times=0;    
          }
        }
        else {
          console.log('failed to read', err);
          closeRequest.onNext(session);
        }

       read(client, times + 1);
      })  
    
    }); 
  }, 1000);
    
    
};

const go = ()=> {
  console.log('go!');
  console.log('ok connecting client..');
  client.connect(endpointUrl, (err) => {
    if(err) {
      go();
    }
    if(!err){
      console.log('connected');
      console.log('creating session..');
      client.createSession( function(err, session) {
        console.log("session created");
        observable.onNext(session);
        //mmm try disconnecting the client when the session gets a fail
        closeRequest.where(s=>s===session).take(1).subscribe(()=>{
          observable.where(s=>s).take(1).subscribe(()=> {
            observable.onNext(false);
            console.log("CLOSE REQUEST FROM SESSION");
            client.disconnect(()=>{});
          });
          

          
        });

        if(err) {
          console.log('failed to create session', err);
          go();
        }
        else {

          console.log('Created session');
          client.once('close', ()=>{
            observable.onNext(false);
            console.log("client closed");
              client.closeSession(session, ()=>{
                client.disconnect(()=>{
                console.log("session closed");
                go();
              });
            });
          });
          
        }
      });
    }
  });
};
read(client, 1);
go();

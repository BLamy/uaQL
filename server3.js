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
    return eventEmitter;
}


class UASession {
  constructor(){
    var observable = new Rx.ReplaySubject(1);
    var closeRequest = new Rx.Subject();
    var client = logAllEmitterEvents(new opcua.OPCUAClient({applicationName: 'uaQL'}));
    this.nextSession=()=> observable.where(s=>s).take(1)
    this.handleError=(session, err)=>{
      console.log(err);
      if(err instanceof Error){
        if(err.message==='Transaction has timed out'){
          closeRequest.onNext(session);
        }
      } else {
        if(err.response && err.response.responseHeader && err.response.responseHeader.serviceResult && err.response.responseHeader.serviceResult.name === 'BadSessionClosed'){
          closeRequest.onNext(session);
        }
      }
    }
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
            console.log('session created');
            observable.onNext(session);
            //mmm try disconnecting the client when the session gets a fail

            if(err) {
              console.log('failed to create session', err);
              go();
            }
            else {
              const sessionCloser = closeRequest.where(s=>s===session).take(1).subscribe(()=>{
                observable.take(1).where(s=>s).subscribe(()=> {
                  observable.onNext(false);
                  console.log('CLOSE REQUEST FROM SESSION');
                  //client.closeSession(session, ()=>{
                    //console.log('session closed');
                    client.disconnect(()=>{
                      console.log('client disconnected');
                      //go();
                    });
                  //});
                  
                });
              });


              console.log('Created session');

              client.once('timed_out_request', (data) => {
                  console.log('timedout request', JSON.stringify(data));
              });
              client.once('close', ()=>{
                sessionCloser.dispose();
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
    go();

  }
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

var sesh = new UASession();
//logAllEmitterEvents(client);
console.log('connecting..');
var latestWrite = 0;
const read = (client, times) => {
    console.log('r');
    sesh.nextSession().subscribe(session=>{
      console.log('-');
      session.read(nodesToRead, function(err, _nodesToRead, results) {
        if(!err){
          if(times===1){
            console.log(`${latestWrite++}: ${new Date().getSeconds()}`);
          }
          else {
            console.log(latestWrite++);
          }
          if(times >= 10){//
            times =0;  
          }
        }
        else {
          sesh.handleError(session, err);
          
        }
        setTimeout(()=>read(client, times + 1),1000);
      })
    
    });
  
    
    
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
        console.log('session created');
        observable.onNext(session);
        //mmm try disconnecting the client when the session gets a fail

        if(err) {
          console.log('failed to create session', err);
          go();
        }
        else {
          const sessionCloser = closeRequest.where(s=>s===session).take(1).subscribe(()=>{
            observable.take(1).where(s=>s).subscribe(()=> {
              observable.onNext(false);
              console.log('CLOSE REQUEST FROM SESSION');
              client.closeSession(session, ()=>{
                console.log('session closed');
                client.disconnect(()=>{
                  console.log('client disconnected');
                  //go();
                });
              });
              
            });
          });


          console.log('Created session');

          client.once('timed_out_request', (data) => {
              console.log('timedout request', JSON.stringify(data));
          });
          client.once('close', ()=>{
            sessionCloser.dispose();
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
//go();

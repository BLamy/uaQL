'use strict';
import opcua from 'node-opcua';
import async from 'async';
import Rx from 'rx';

const endpointUrl = 'opc.tcp://opcua.demo-this.com:51210/UA/SampleServer';


function logAllEmitterEvents(eventEmitter)
{
    var emitToLog = eventEmitter.emit;

    eventEmitter.emit = function () {
        var event = arguments[0];
        console.log("event emitted: " + event, JSON.stringify(arguments, null, '\t'));
        emitToLog.apply(eventEmitter, arguments);
    };
}


//opc.tcp://opcserver.mAutomation.net:4841  mFactor Engineering
//opc.tcp://commsvr.com:51234/UA/CAS_UA_Server  CommServer
//opc.tcp://uademo.prosysopc.com:53530/OPCUA/ prosys OPC
//opc.tcp://opcua.demo-this.com:51210/UA/SampleServer opclabs
//opc.tcp://opcua.demo-this.com:51211/UA/SampleServer opclabs
//opc.tcp://opcua.demo-this.com:51212/UA/SampleServer opclabs
//opc.tcp://demo.ascolab.com:4841

//provides an observable with the current session - reactivates and reconnects as required
//todo subscriptions should go through this and be reinstated on reconnect
class OpcUaConnector {
  constructor(){
    var session;
    const observable = new Rx.ReplaySubject(1);
    var ss=0;
    this.session2 = () => observable;
    this.session = () => observable.where(s=>{
      if(s){
        console.log('yes s was ok', ss++);
        return true;
      }
      console.log('no s', ss++);

      });
    var client;
    
    const connect = ()=> {
      client = new opcua.OPCUAClient({requestedSessionTimeout:1000});
      client.once('close', ()=> {
        observable.onNext(false);
        connect();   
      });
      client.once('start_reconnection', ()=> {
        observable.onNext(false);
        session.close(()=>{
          console.log("START RECONNECTION seen disconnecting");
          client.disconnect(()=>console.log('DISCONNECTED'));   
          console.log("START RECONNECTION seen disconnection called");
        });
        
      });
      logAllEmitterEvents(client);
      console.log('there is no session available');
      
      console.log('connecting..');
      client.connect(endpointUrl, (err) => {
        if(!err){
          console.log('connected');
          console.log('creating session..');
          client.createSession( function(err, _session) {
            if(!err){
                session = _session;
                observable.onNext(()=>session);
                console.log('session created');
            } else
            {
              client.disconnect();
            }
          });
        }
        else {
          console.log('connection failed', err);
          connect();
        }
      });
    };
    //attempt to reactivate if fails connect
    const reactivate = ()=> {
      console.log('no session');
      observable.onNext(null);
      console.log('reactivating..');
      client.reactivateSession(session, (err)=>{
        if(!err){
          console.log('reactivated');
          observer.onNext(session);
        }
        else
        {
          console.log('failed to reactivate', err);
          connect();
        }
      });
    };
    
    connect();
  }
}

const connector = new OpcUaConnector();
const session2 = connector.session2;
export default connector.session;
export {opcua as opcua, session2 as session2};

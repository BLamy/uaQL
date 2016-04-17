'use strict';
import opcua from 'node-opcua';
import async from 'async';
import Rx from 'rx-lite';

const endpointUrl = 'opc.tcp://opcua.demo-this.com:51210/UA/SampleServer';


function logAllEmitterEvents(eventEmitter)
{
    var emitToLog = eventEmitter.emit;

    eventEmitter.emit = function () {
        var event = arguments[0];
        if(event!='receive_response' && event!='receive_chunk' && event!='send_request' && event!='send_chunk')
          console.log("event emitted: " + event);//, JSON.stringify(arguments, null, '\t'));
        emitToLog.apply(eventEmitter, arguments);
    };
    return eventEmitter;
}


//opc.tcp://opcserver.mAutomation.net:4841  mFactor Engineering
//opc.tcp://commsvr.com:51234/UA/CAS_UA_Server  CommServer
//opc.tcp://uademo.prosysopc.com:53530/OPCUA/ prosys OPC
//opc.tcp://opcua.demo-this.com:51210/UA/SampleServer opclabs
//opc.tcp://opcua.demo-this.com:51211/UA/SampleServer opclabs
//opc.tcp://opcua.demo-this.com:51212/UA/SampleServer opclabs
//opc.tcp://demo.ascolab.com:4841

const pinger = (session, handle)=> {
  /*session.browse('', function(err, browseResult){
    if(!err){
      setTimeout(()=>pinger(session, handle), 10000);
    }
    else {
      handle(session,err);
    }
  });*/
}

class UASession {
  constructor(){
    const _this=this;
    var observable = new Rx.ReplaySubject(1);
    var closeRequest = new Rx.Subject();
    var client = logAllEmitterEvents(new opcua.OPCUAClient({applicationName: 'uaQL'}));
    this.nextSession=()=> observable.where(s=>s).take(1)
    this.handleError=(session, err)=>{
      try{
        console.log('ERROR to handle', JSON.stringify(err, null, '\t'));
        console.log('eh?');
        //if(err instanceof Error){
          console.log('err details', err.name, err.message);
          if(err.message==='Transaction has timed out'){
            console.log('closing request', session);
            closeRequest.onNext(session);
          }
        //} else {
          console.log('err not instanceof Error');
          if(err){
            console.log('err');
            if(err.response)
            {
              console.log('err.response');
              if(err.response.responseHeader)
              {
                console.log('err.response.responseHeader');
                if(err.response.responseHeader.serviceResult)
                {
                  console.log('err.response.responseHeader.serviceResult');
                  console.log('name:', err.response.responseHeader.serviceResult.name);
                }
              }
            }
          }
          if(err
            && err.response
            && err.response.responseHeader
            && err.response.responseHeader.serviceResult
            && err.response.responseHeader.serviceResult.name === 'BadSessionClosed'){
            console.log('closing request', session);
            closeRequest.onNext(session);
          }
        //}
      } catch(ex) {
        console.log('ERRRRRRRRRRRRRRRRRRRRRRRR:', ex);
      }
      
      return err;
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
            //mmm try disconnecting the client when the session gets a fail

            if(err) {
              console.log('failed to create session', err);
              go();
            }
            else {
              pinger(session, _this.handleError);
              console.log('session created');
              observable.onNext(session);
            
              const sessionCloser = closeRequest.where(s=> {
                  console.log('close request seen but..', s===session);
                  return s===session;

              }


                ).take(1).subscribe(()=>{
                console.log('session closer...');
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


              console.log('Created session', new Date());

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


const connector = new UASession();
const nextSession = connector.nextSession;
const handleError = connector.handleError;
//export default connector.session;
export {opcua as opcua, nextSession as nextSession, handleError as handleError};

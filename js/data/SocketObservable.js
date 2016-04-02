// @flow

import rx, {Observable} from 'rx-lite';
import io from 'socket.io-client';


class SocketObservable {
  nextSocket: Function;
  constructor() {
  	const observable = new Rx.ReplaySubject(1);
    this.nextSocket=()=> observable.where(s=>s).take(1);
    const socket = io.connect('/', {path: '/napi/socket.io'});
	socket.on('connect', ()=>observable.onNext(socket));    
	socket.on('reconnect_attempt', ()=>observable.onNext(null));
  }
}

const socketListen = (socket : any) =>
{
  const data= new rx.ReplaySubject(1);
  socket.on('update', (msg)=> {
    data.onNext(msg);
  });
  return {socket, data};
  //socket.removeAllListeners("news");
};

const socketObserve= (socket: any, data: any, nodeId : string)=>{
  socket.emit('join', nodeId);
  console.log('join', nodeId);
  return rx.Observable.create(subscribe=>{
    console.log('subscribed');
    const sub = data
      .filter(n=>n.nodeId===nodeId)
    	.subscribe((x)=> {
        subscribe.onNext(x);
      });
    return ()=> {
      socket.emit('leave', nodeId);
      sub.dispose();
    }
  });
} 

const socketObservable= new SocketObservable();

const observable = (nodeId : string)=> 
	socketObservable
	  .nextSocket()
	  .filter(s=>s)
    .map(socketListen)
	  .map(({socket, data}) => socketObserve(socket, data, nodeId))
	  .switch();

export default observable;

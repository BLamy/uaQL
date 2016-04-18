// @flow

import {Observable, ReplaySubject} from 'rx-lite';
import {opcua, nextSession, handleError} from './data/opcua';


var sub = new ReplaySubject(1);

nextSession().subscribe(session=>sub.onNext(
	new opcua.ClientSubscription(session,{
		requestedPublishingInterval: 1000,
		requestedLifetimeCount: 10,
		requestedMaxKeepAliveCount: 2,
		maxNotificationsPerPublish: 10,
		publishingEnabled: true,
		priority: 10
	})
));
    

class NodeSocket {
  destroy: Function;
  constructor(nodeId : string, io : any){
  	const _this=this;
  	const timer = sub.select(subscription => Observable.create((obs)=> {
  		console.log('erewego', nodeId, sub);
  		try {
	  		
			// install monitored item
			//console.log('monitoring', nodeId);
			let monitoredItem  = subscription.monitor({
			    nodeId: opcua.resolveNodeId(nodeId.split(':').slice(1).join()),
			    attributeId: 13,// opcua.AttributeIds[nodeId.split(':')[0]]
			},
			{
			    samplingInterval: 1000,
			    discardOldest: true,
			    queueSize: 10
			},
			opcua.read_service.TimestampsToReturn.Both
			);
			console.log("-monitoring",  subscription.subscriptionId, nodeId);

			monitoredItem.on("changed",function(dataValue){
			   	obs.onNext(dataValue);
			});
		} catch(ex) {
			console.log("caught error", ex);
			obs.onError(ex);
		}
  		return ()=>{}; //subscription.terminate();
  	} )).switch().subscribe(x => {
  		_this.lastValue = {
	      	nodeId: nodeId,
	      	value: x
		};

  		io.to(nodeId).emit('update', _this.lastValue );
  		});
  	
    this.destroy = ()=> timer.dispose();
  }
  
}

export default NodeSocket;
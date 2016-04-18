// @flow

import {Observable, ReplaySubject} from 'rx-lite';
import {opcua, sessions, handleError} from './data/opcua';



var sub = new ReplaySubject(1);

sessions.subscribe(session=>{ 
	console.log('session ...', session);
	if(session) {
		sub.onNext(
			new opcua.ClientSubscription(session,{
				requestedPublishingInterval: 1000,
				requestedLifetimeCount: 10,
				requestedMaxKeepAliveCount: 2,
				maxNotificationsPerPublish: 10,
				publishingEnabled: true,
				priority: 10
			})
		);
	} else {
		sub.onNext(null);
	}
});
    

class NodeSocket {
  destroy: Function;
  constructor(nodeId : string, io : any){
  	const _this=this;
  	const timer = sub.select(subscription => Observable.create(
			obs=> {
				if(subscription) {
					try {
							
						// install monitored item
						//console.log('monitoring', nodeId);
						let monitoredItem  = subscription.monitor({
								nodeId: opcua.resolveNodeId(nodeId.split(':').slice(1).join()),
								attributeId: opcua.AttributeIds[nodeId.split(':')[0]]
						},
						{
								samplingInterval: 1000,
								discardOldest: true,
								queueSize: 10
						},
						opcua.read_service.TimestampsToReturn.Both
						);
						
						monitoredItem.on("changed",function(dataValue){
								obs.onNext(dataValue);
						});
						console.log("-monitoring",  subscription.subscriptionId, nodeId);

					} catch(ex) {
						console.log("caught error", ex);
						obs.onError(ex);
					}
				} else {
					obs.onNext(null);
				}
				return ()=>{};
			} 
		)).switch().subscribe(x => {
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
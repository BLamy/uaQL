// @flow

import {Observable} from 'rx-lite';
import {opcua, nextSession, handleError} from './data/opcua';

class NodeSocket {
  destroy: Function;
  constructor(nodeId : string, io : any){
  	const _this=this;
  	const timer = nextSession().select(session => Observable.create((obs)=> {
  		const subscription = new opcua.ClientSubscription(session,{
		    requestedPublishingInterval: 5000,
		    requestedLifetimeCount: 10,
		    requestedMaxKeepAliveCount: 2,
		    maxNotificationsPerPublish: 10,
		    publishingEnabled: true,
		    priority: 10
		});

  		try {
	  		
			subscription.on('started',function(){
			    //console.log(`subscription started - subscriptionId=`,subscription.subscriptionId);
			}).on("keepalive",function(){
			    console.log("subscription - keepalive", subscription.subscriptionId);
			}).on("terminated",function(){
			    console.log("subscription - terminated", subscription.subscriptionId, nodeId);
			});
			// install monitored item
			//console.log('monitoring', nodeId);
			let monitoredItem  = subscription.monitor({
			    nodeId: opcua.resolveNodeId(nodeId.split(':').slice(1).join()),
			    attributeId: opcua.AttributeIds[nodeId.split(':')[0]]
			},
			{
			    samplingInterval: 5000,
			    discardOldest: true,
			    queueSize: 10
			},
			opcua.read_service.TimestampsToReturn.Both
			);
			console.log("-monitoring",  subscription.subscriptionId, nodeId);

			monitoredItem.on("changed",function(dataValue){
			   	obs.onNext(dataValue);
				console.log(JSON.stringify(dataValue,null, '\t'));
			});
		} catch(ex) {
			console.log("caught error", ex);
			obs.onError(ex);
		}
  		return ()=>subscription.terminate();
  	} )).switch().subscribe(x => {
  		_this.lastValue = {
	      nodeId: nodeId,
	      value: x};

  		io.to(nodeId).emit('update', _this.lastValue );
  		});
  	
    this.destroy = ()=> timer.dispose();
  }
  
}

export default NodeSocket;
// @flow

import {Observable} from 'rx-lite';
import {opcua, nextSession, handleError} from './data/opcua';

class NodeSocket {
  destroy: Function;
  constructor(nodeId : string, io : any){
  	const _this=this;
  	const timer = nextSession().select(session => Observable.create((obs)=> {
  		const subscription = new opcua.ClientSubscription(session,{
		    requestedPublishingInterval: 1000,
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
			    //console.log("subscription - keepalive", subscription.subscriptionId);
			}).on("terminated",function(){
			    //console.log("subscription - keepalive", subscription.subscriptionId);
			});
			// install monitored item
			//console.log('monitoring', nodeId);
			let monitoredItem  = subscription.monitor({
			    nodeId: opcua.resolveNodeId(nodeId.split(':').slice(1).join()),
			    attributeId: opcua.AttributeIds[nodeId.split(':')[0]]
			},
			{
			    samplingInterval: 100,
			    discardOldest: true,
			    queueSize: 10
			},
			opcua.read_service.TimestampsToReturn.Both
			);
			console.log("-------------------------------------");

			monitoredItem.on("changed",function(dataValue){
				console.log('opc change', dataValue);
			   	obs.onNext(dataValue);
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
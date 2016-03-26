// @flow

import {Observable} from 'rx';
import {opcua, nextSession, handleError} from './data/opcua';

class NodeSocket {
  destroy: Function;
  constructor(nodeId : string, io : any){
  	const timer = nextSession().select(session => Observable.create((obs)=> {


  		const subscription = new opcua.ClientSubscription(session,{
		    requestedPublishingInterval: 1000,
		    requestedLifetimeCount: 10,
		    requestedMaxKeepAliveCount: 2,
		    maxNotificationsPerPublish: 10,
		    publishingEnabled: true,
		    priority: 10
		});

		subscription.on('started',function(){
		    console.log(`subscription started - subscriptionId=`,subscription.subscriptionId);
		}).on("keepalive",function(){
		    console.log("subscription - keepalive", subscription.subscriptionId);
		}).on("terminated",function(){
		    console.log("subscription - keepalive", subscription.subscriptionId);
		});
		// install monitored item
		console.log('monitoring', nodeId);
		let monitoredItem  = subscription.monitor({
		    nodeId: opcua.resolveNodeId(nodeId),
		    attributeId: opcua.AttributeIds.Value
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
		   obs.onNext(dataValue.value.value);
		});

  		return ()=>subscription.terminate();
  	} )).switch().subscribe(x => io.to(nodeId).emit('update', {
      nodeId: nodeId,
      value: x}));
    this.destroy = ()=> timer.dispose();
  }
  
}

export default NodeSocket;
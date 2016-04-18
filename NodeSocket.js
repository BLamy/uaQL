// @flow

import {Observable} from 'rx-lite';
import {opcua, nextSession, handleError} from './data/opcua';

const sub = nextSession().select(session =>
	new opcua.ClientSubscription(session,{
		requestedPublishingInterval: 1000,
		requestedLifetimeCount: 10,
		requestedMaxKeepAliveCount: 2,
		maxNotificationsPerPublish: 10,
		publishingEnabled: true,
		priority: 10
	})
);

class NodeSocket {
  destroy: Function;
  constructor(nodeId : string, io : any){
  	const _this=this;
  	const timer = Observable.create((obs)=> {
  		
  		try {
	  		
			  setInterval(()=>obs.onNext(
				  
				  {
					"value": {
						"dataType": "Double",
						"arrayType": "Scalar",
						"value": -0.4725018725
					},
					"statusCode": {
						"value": 0,
						"description": "No Error",
						"name": "Good"
					},
					"sourceTimestamp": "2016-04-14T08:21:40.762Z",
					"sourcePicoseconds": 0,
					"serverTimestamp": "2016-04-18T09:32:59.948Z",
					"serverPicoseconds": 0
				}

				  
			  ), 20000);
			
			// install monitored item
			//console.log('monitoring', nodeId);
/*			let monitoredItem  = subscription.monitor({
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
			}); */
		} catch(ex) {
			console.log("caught error", ex);
			obs.onError(ex);
		}
  		return ()=>subscription.terminate();
  	} )/*.switch()*/.subscribe(x => {
  		_this.lastValue = {
	      nodeId: nodeId,
	      value: x};

  		//io.to(nodeId).emit('update', _this.lastValue );
  		});
  	
    this.destroy = ()=> timer.dispose();
  }
  
}

export default NodeSocket;
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

let requiredPolls = [];
let currentSubscription;
sub.subscribe(subscription => currentSubscription=subscription);
let poll = ()=>{
	if(!currentSubscription){
		setTimeout(poll, 1000);
	} else {
		let nodesToRead = requiredPolls.map(p=>p);
		currentSubscription.session.read(nodesToRead.map(p=>p.nodeDefinition), null, (err,nodes, dataValues)=>{
			if(err) {
				nodesToRead.forEach((node)=> {
					delete node.value;
					node.obs.onNext(null);
				});
			} else {
				dataValues.forEach((dv,i)=>{
					if(dv && dv.value && dv.value.value !== nodesToRead.value) {
						nodesToRead[i].value = dv.value.value;
						nodesToRead[i].obs.onNext(dv);	
					} else {
						if(!dv || !dv.value) {
							nodesToRead[i].value=undefined;
							nodesToRead[i].obs.onNext(dv);
						}
					}
					
					
				});
			}
			setTimeout(poll, 1000);
		});
	}
};
poll();

class NodeSocket {
  destroy: Function;
  constructor(nodeId : string, io : any){
  	const _this=this;
  	const myMonitor = sub.select(subscription => Observable.create(
			obs=> {
				if(subscription) {
					try {
						let nodeDefinition = {
							nodeId: opcua.resolveNodeId(nodeId.split(':').slice(1).join()),
							attributeId: opcua.AttributeIds[nodeId.split(':')[0]]
						};
						if(nodeId.split(':')[0] !== 'Executable') {
							// install monitored item
							//console.log('monitoring', nodeId);
							let monitoredItem  = subscription.monitor(nodeDefinition,
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
							return ()=>monitoredItem.terminate();	
						} else {
							let requiredPoll = {
								obs,
								nodeDefinition
							};
							requiredPolls.push(requiredPoll);
							
							return ()=>requiredPolls.splice(requiredPolls.indexOf(requiredPoll), 1);
						}
						

					} catch(ex) {
						console.log("caught error", ex);
						obs.onError(ex);
					}
				} else {
					obs.onNext(null);
				}
				
			} 
		)).switch().subscribe(x => {
  		_this.lastValue = {
	      	nodeId: nodeId,
	      	value: x
			};
  		io.to(nodeId).emit('update', _this.lastValue );
  	});
  	
    this.destroy = ()=> myMonitor.dispose();
  }
}

export default NodeSocket;
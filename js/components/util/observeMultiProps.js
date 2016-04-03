// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {compose, doOnReceiveProps} from 'recompose';
import {Observable} from 'rx-lite';
import {observeProps} from 'rx-recompose';
import socketObservable from '../../data/SocketObservable'
import merge from 'merge';


const observeMultiProps = (props, _viewer)=>
  observeProps(props$=>{
    const viewer = props$.map(p=>p[_viewer || 'viewer'])
    const existing = {};
    existing[_viewer || 'viewer'] = viewer;

    return props.reduce((previousValue, currentValue)=>{     
      previousValue[currentValue.name] = viewer.map(v=>{
        if(v[currentValue.property]) {
          return socketObservable(`${currentValue.attributeId}:ns=${v[currentValue.property].nodeId.namespace};i=${v[currentValue.property].nodeId.value}`);
        } else {
          return Observable.return();
        }
      })
      .switch();
      return previousValue;
    }, existing);
  });

export default observeMultiProps;      

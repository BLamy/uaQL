// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {compose, doOnReceiveProps} from 'recompose';
import {Observable} from 'rx';
import {observeProps} from 'rx-recompose';
import socketObservable from '../../data/SocketObservable'
import merge from 'merge';


const observeMultiProps = (props)=>
  observeProps(props$=>{
      const viewer = props$.map(p=>p.viewer)
      return props.reduce((previousValue, currentValue)=>{
        previousValue[currentValue] = viewer.map(v=>{
            if(v[currentValue]) {
              console.log('returni g', currentValue, `ns=${v[currentValue].nodeId.namespace};i=${v[currentValue].nodeId.value}`);
              return socketObservable(`ns=${v[currentValue].nodeId.namespace};i=${v[currentValue].nodeId.value}`);
            } else {
              console.log('not returni g', currentValue);
              return Observable.return();
            }
          })
          .switch();
          return previousValue;
        },{viewer});
    });

export default observeMultiProps;      

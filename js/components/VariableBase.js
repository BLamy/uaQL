// @flow

import React from 'react';
import Relay from 'react-relay';
import {doOnReceiveProps} from 'recompose';


const setVariableNodeClass = [doOnReceiveProps((props)=>{
  props.relay.setVariables({
    'nodeClassIsVariable': props.viewer.nodeClass ==='Variable'
  });
})];

export default setVariableNodeClass;


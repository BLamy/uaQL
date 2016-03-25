// @flow

import React from 'react';
import Relay from 'react-relay';
import VariableBase from './VariableBase';
import {createContainer} from 'recompose-relay';
import {compose, doOnReceiveProps} from 'recompose';


const DataValue = compose(
  createContainer(
    {
      initialVariables: {
        'nodeClassIsVariable': undefined
      },
      fragments: {
        viewer: () => Relay.QL`
          fragment on UANode {  
            nodeClass
            dataValue @include(if: $nodeClassIsVariable) {
              ... on IUaDataValue {
                dataType
                arrayType      
                ... on UaLong {
                  value
                }
                ... on UaFloat {
                  value
                }
                ... on UaInt {
                  value
                }
                ... on UaDate {
                  value
                }
                ... on UaBoolean {
                  value
                }
                ... on UaString {
                  value
                }
                ... on UaLongArray {
                  value
                }
                ... on UaFloatArray {
                  value
                }
                ... on UaIntArray {
                  value
                }
                ... on UaDateArray {
                  value
                }
                ... on UaBooleanArray {
                  value
                }
                ... on UaStringArray {
                  value
                }
              }
            }
          }
         `
        }
      }
    ),
    VariableBase
  )(({viewer})=>
    <span>
        {viewer.dataValue
          ? <div title='dataValue'>
              {viewer.dataValue.arrayType==='Array'
                ? <ul>
                    {viewer.dataValue.value.map((v,i)=>
                      <li key={i}>
                        {v}
                      </li>
                    )}
                  </ul>
                : viewer.dataValue.value.toString()
              }
            </div>
          : undefined
        }
      </span>
    );

export default DataValue;

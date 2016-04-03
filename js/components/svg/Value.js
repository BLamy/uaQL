// @flow

'use strict';

import React from 'react';
import {compose} from 'recompose';


const Value = compose(

  

)(({value,x,y})=> 



    value && !value.statusCode.value 
      ? <text x={x} y={y} fontSize="20pt">{value.value ? Math.round((value.value.value + 0.00001) * 100) / 100 : null}</text>
      : <text x={x} y={y} fontSize="20pt" style={{color:'red'}}>{value ? value.statusCode.name : ':('}</text>
  
);


/*

<g viewBox="0 0 100 94.335">
  <g>
    <path d="M29.167,37.445c-9.722,0-19.444,4.755-29.167,7.614V56.17c9.722-2.858,19.444-7.614,29.167-7.614   c13.889,0,27.778,9.723,41.667,9.723c9.723,0,19.444-4.757,29.167-7.614V39.553c-9.723,2.857-19.444,7.614-29.167,7.614   C56.944,47.167,43.056,37.445,29.167,37.445z"></path>
    <path d="M29.167,59.667c-9.722,0-19.444,4.755-29.167,7.614v11.111c9.722-2.859,19.444-7.614,29.167-7.614   c13.889,0,27.778,9.722,41.667,9.722c9.723,0,19.444-4.757,29.167-7.614V61.775c-9.723,2.858-19.444,7.614-29.167,7.614   C56.944,69.389,43.056,59.667,29.167,59.667z"></path>
    <path d="M70.833,24.945c-13.889,0-27.777-9.722-41.667-9.722c-9.722,0-19.444,4.755-29.167,7.615v11.111   c9.722-2.859,19.444-7.614,29.167-7.614c13.889,0,27.778,9.722,41.667,9.722c9.723,0,19.444-4.757,29.167-7.615V17.331   C90.277,20.189,80.556,24.945,70.833,24.945z"></path>
  </g>
  <rect x="44.444" y="-3.825" transform="matrix(0.8716 0.4903 -0.4903 0.8716 29.5455 -18.4554)" width="11.111" height="101.985"></rect>
</g>

*/

export default Value;


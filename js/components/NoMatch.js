// @flow

'use strict';


import React from 'react';
import {Link} from 'react-router';

class NoMatch extends React.Component {
  render() {
    return (
      <div>
      	Try <Link to="/ns=0;i=84">here</Link>
      </div>
    );
  }
}


export default NoMatch;
// @flow

'use strict';

import React from 'react';
import Relay from 'react-relay';
import {compose} from 'recompose';
import ReferenceLink from './ReferenceLink';

import ReferenceTypeIcon from './ReferenceTypeIcon';


import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';








const ReferenceTable= compose(


)(({references})=>

  <Table selectable={false}>
    <TableBody displayRowCheckbox={false}>
      {references.map(r=>
        <TableRow key={r.node.id}>
          <TableRowColumn style={{width:'20px', padding:'0px'}}><ReferenceTypeIcon viewer={r.node}/></TableRowColumn>
          <TableRowColumn><ReferenceLink viewer={r.node}/></TableRowColumn>
        </TableRow>
      )}
    </TableBody>
  </Table>
);


export default ReferenceTable;

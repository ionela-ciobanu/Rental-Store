import {Meteor} from 'meteor/meteor';
import React from 'react';

import PrivateHeader from './PrivateHeader';
import PersonalInfo from './PersonalInfo';

export default class MyAccount extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <PrivateHeader title="Rental Store"/>

        <div className="page__content">

          <PersonalInfo/>

        </div>

      </div>
    );
  }
}

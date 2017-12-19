import {Meteor} from 'meteor/meteor';
import React from 'react';

import PrivateHeader from './PrivateHeader';
import PersonalInfo from './PersonalInfo';
import MyPosts from './MyPosts';

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
          <MyPosts/>

        </div>

      </div>
    );
  }
}

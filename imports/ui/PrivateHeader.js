import React from 'react';
import PropTypes from 'prop-types';
import {Accounts} from 'meteor/accounts-base';
import {Link} from 'react-router-dom';

export default class PrivateHeader extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className="header">
          <div className="header__content">
            <h1><Link className="header__title" to='/'>{this.props.title}</Link></h1>
            <div>
              <Link className="button--link" to='/addPost'>Adauga un anunt</Link>
              <button className="button button--link-text" onClick={() => Accounts.logout()}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PrivateHeader.PropTypes = {
  title: PropTypes.string.isRequired
};

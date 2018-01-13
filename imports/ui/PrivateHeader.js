import React from 'react';
import PropTypes from 'prop-types';
import {Accounts} from 'meteor/accounts-base';
import {Link} from 'react-router-dom';
import {Session} from 'meteor/session';

export default class PrivateHeader extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className="header">
          <div className="header__content">
            <h1 className="header__title"><Link className="header__link" to='/'>{this.props.title}</Link></h1>
            <div className="header__menu">
              <Link className="button header__link" to='/addPost'>Adauga un anunt</Link>
              <Link className={Session.get('userData') !== undefined ? Session.get('userData').personalInfo.newMessagesCount > 0 ?
                "yellow__text button header__link" : "button header__link" : undefined} to='/myAccount'>Contul meu
                {Session.get('userData') !== undefined ? Session.get('userData').personalInfo.newMessagesCount > 0 ? ' !' : undefined : undefined}</Link>
              <button className="button" onClick={() => Accounts.logout()}>Logout</button>
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

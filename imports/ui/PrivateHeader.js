import React from 'react';
import PropTypes from 'prop-types';
import {Accounts} from 'meteor/accounts-base';
import {Tracker} from 'meteor/tracker';
import {Link} from 'react-router-dom';
import {Session} from 'meteor/session';

import {Messages} from '../api/messages';

export default class PrivateHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allMyMessages: null
    };
    this.getUnreadMessages = this.getUnreadMessages.bind(this);
    this.startTracking = this.startTracking.bind(this);
  }

  componentDidMount() {
    Meteor.setTimeout(this.startTracking, 0);
  }

  startTracking() {
    var handleMessages = Meteor.subscribe('allMyMessages');
    this.messagesTracker = Tracker.autorun(() => {
      if(handleMessages.ready()) {
        this.setState({allMyMessages: Messages.find({receiverId: Meteor.userId()}).fetch()});
        this.getUnreadMessages();
      }
    });
  }

  componentWillUnmount() {
    this.messagesTracker.stop();
  }

  getUnreadMessages() {
    const unreadMessages = 0;
    Meteor.setTimeout(() => {
      this.state.allMyMessages.map((message) => {
        if(!message.read) {
          unreadMessages ++;
        }
      });
      Session.set('unreadMessages', unreadMessages);
    }, 1000);
  }

  render() {
    return (
      <div>
        <div className="header">
          <div className="header__content">
            <h1 className="header__title"><Link className="header__link" to='/'>{this.props.title}</Link></h1>
            <div className="header__menu">
              <Link className="button header__link" to='/posts' onClick={() => {
                Session.set({category: null, keyword: null, isAvailable: false, showMyPosts: false,
                  currency: null, maxPrice: null, city: null});
                  }}>Toate anunturile</Link>
              <Link className="button header__link" to='/addPost'>Adauga un anunt</Link>
              <div className="header__account">
                <Link className="button header__link" to='/myAccount'>Contul meu</Link>
                {Session.get('unreadMessages') > 0 ?
                  <Link to="/myAccount"><div className="bell">
                    <p className="bell__message">{Session.get('unreadMessages') === 1 ?
                      'Ai un mesaj nou' : 'Ai ' + Session.get('unreadMessages') + ' mesaje noi'
                    }</p>
                  </div></Link>
                : undefined }
              </div>
              <p onClick={() => Accounts.logout()}>Logout</p>
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

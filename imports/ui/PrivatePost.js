import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Link} from 'react-router-dom';
import {Session} from 'meteor/session';

import {Messages} from '../api/messages';

export default class PrivatePost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      link: "/posts/".concat(this.props._id),
      period: ''
    }
    this.addToYesList = this.addToYesList.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.blockPost = this.blockPost.bind(this);
    this.unblockPost = this.unblockPost.bind(this);
    this.removeFromYesList = this.removeFromYesList.bind(this);
    this.getPeriod = this.getPeriod.bind(this);
    this.makePostInactive = this.makePostInactive.bind(this);
    this.makePostActive = this.makePostActive.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
  };
  componentDidMount() {
    if(this.props.isBlocked !== null) {
      this.getPeriod();
    }
  }
  componentWillUnmount() {
    Meteor.clearInterval(this.interval);
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.isBlocked === null && nextProps.isBlocked !== null) {
      this.getPeriod();
    }
  }

  addToYesList() {
    Meteor.call('users.addToYesList', this.props._id);
    Meteor.call('posts.incrementLikesCount', this.props._id);
  }

  removeFromYesList() {
    Meteor.call('users.removeFromYesList', this.props._id);
    Meteor.call('posts.decrementLikesCount', this.props._id);
  }

  getPeriod() {
    Meteor.setTimeout(() => {
      const isBlocked = moment(this.props.isBlocked);
      const finish = isBlocked.add(30, 'minutes');
      this.interval = Meteor.setInterval(() => {
        const now = moment();
        const after = now.isAfter(finish);
        if(after || this.props.isBlocked === null) {
          this.setState({period: ''});
          this.unblockPost();
          Meteor.clearInterval(this.interval);
        } else {
          const diff = moment.utc(moment(finish, "HH:mm:ss").diff(moment(now,"HH:mm:ss"))).format("mm:ss");
          this.setState({period: diff});
        }
      }, 1000);
    },100);
  }

  sendMessage(e) {
    e.preventDefault();
    const message = this.refs.message.value.trim();
    const messageType = e.target.messageType.value;
    const error = false;
    if(message.length < 4) {
      this.setState({errorMessage: 'Mesajul este prea scurt.'});
      error = true;
    }
    if(!messageType) {
      this.setState({errorMessageType: 'Selecteaza tipul mesajului.'});
      error = true;
    }
    if(!error) {
      this.setState({errorMessageType: ''});
      if(Session.get('userData').personalInfo.firstName && Session.get('userData').personalInfo.lastName
        && Session.get('userData').personalInfo.address && Session.get('userData').personalInfo.phone) {

          if(messageType === 'public') {
            Meteor.call('messages.sendMessage', this.props.userId, this.props._id, message, true);
            e.target.reset();
          } else {
            Meteor.call('messages.sendMessage', this.props.userId, '', message, false);
            e.target.reset();
          }
      } else {
        alert('Pentru a trimite un mesaj, completeaza informatiile personale.');
      }
    }
  }

  blockPost() {
    Meteor.call('users.addToBlockedPosts', this.props._id);
    Meteor.call('posts.blockPost', this.props._id);

    this.getUserInfo(this.props.userId, (res) => {
      // Meteor.call('sendEmail', res.emails[0].address, 'support@rentalstore.com', 'Rental Store - Anuntul tau a fost blocat.',
      //   `${Meteor.user().username} a blocat anuntul tau cu codul ${this.props._id}.`, (err, res) => {
      //   if(!err) {
      //     console.log('Email-ul a fost trimis.');
      //   } else {
      //     console.log('Email-ul NU a fost trimis');
      //   }
      // });
    });
  }

  unblockPost() {
    Meteor.call('users.removeFromBlockedPosts', this.props._id, this.props.isBlockedBy);
    Meteor.call('posts.unblockPost', this.props._id);
    this.setState({period: ''});
    Meteor.clearInterval(this.interval);
  }

  makePostActive() {
    Meteor.call('users.removeFromInactivePosts', this.props._id);
    Meteor.call('posts.makePostActive', this.props._id);
  }

  makePostInactive() {
    Meteor.call('users.addToInactivePosts', this.props._id);
    Meteor.call('posts.makePostInactive', this.props._id);
  }

  getUserInfo(_id, callback) {
    const handle = Meteor.subscribe('userInfo', _id);
    var userInfo;
    Meteor.setTimeout(() => {
      if(handle.ready()) {
        userInfo = Meteor.users.findOne({_id});
        callback(userInfo);
      }
    }, 1000);
  }

  render() {
    return (
      <div>
        {Session.get('userData') !== undefined ?

        <div className="post">
          <div className="post__header">
            <div className="post__pins">
              {this.props.isAvailable ?
                <div className="post__info">
                  <div className="post__pin">
                    <img src="greenPin.png" className="post__icon"/>
                    <div className="post__pinDetails green">
                      {Session.get('userData') !== undefined ?
                        Session.get('userData')._id === this.props.userId ?
                          <div>
                            <p>Anuntul meu</p>
                            <button onClick={this.makePostInactive}>Dezactiveaza anuntul</button>
                          </div>
                        : Session.get('userData').personalInfo.canBlock ?
                          <div>
                            <p>Acest anunt este disponibil. Ai posibilitatea de a-l bloca pentru 30 de minute,
                              timp in care doar tu vei vedea detaliile acestuia. Profita de ocazie pentru a
                              ajunge la un consens cu posesorul anuntului.</p>
                            <button onClick={this.blockPost}>Blocheaza anuntul</button>
                          </div>
                          : <p>Acest anunt este disponibil. Nu poti bloca alte anunturi !</p>
                      : undefined }
                    </div>
                  </div>
                  {Session.get('userData') !== undefined ?
                    Session.get('userData')._id === this.props.userId ? undefined
                    : <div className="post__actions">
                        <img src="message.png" className="post__icon"/>
                        <div className="post__message">
                          <form onSubmit={this.sendMessage}>
                            {this.state.errorMessageType ? <p>{this.state.errorMessageType}</p> : undefined}
                            Public&nbsp;<input type="radio" name="messageType" value="public" onClick={() => {this.setState({errorMessageType:''})}}/>&nbsp;
                            Privat&nbsp;<input type="radio" name="messageType" value="privat" onClick={() => {this.setState({errorMessageType:''})}}/>
                            {this.state.errorMessage ? <p>{this.state.errorMessage}</p> : undefined}
                            <input type="text" placeholder="Scrie mesajul tau"
                              ref="message" onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                                  this.setState({errorMessage: ''});
                                                }}}/>
                            <button>Trimite mesajul</button>
                          </form>
                        </div>
                      </div>
                  : undefined }
                </div>
                : this.props.isBlocked !== null ?
                  <div className="post__info">
                    <div className="post__pin">
                      <img src="pinkPin.png" className="post__icon"/>
                      <div className="post__pinDetails pink">
                        {Session.get('userData') !== undefined ?
                          Session.get('userData')._id === this.props.userId ?
                            <p>Anuntul meu este blocat.</p>
                          : <p>Acest anunt este blocat.</p>
                        : undefined }
                        {this.state.period ? this.state.period : undefined}
                        {Session.get('userData').personalInfo.blockedPosts.length > 0 ?
                          Session.get('userData').personalInfo.blockedPosts[0]._id === this.props._id ?
                            <button onClick={this.unblockPost}>Deblocheaza anuntul</button>
                          : undefined : undefined }
                      </div>
                    </div>
                    {this.state.period ? <p>{this.state.period}</p> : undefined}
                    {Session.get('userData') !== undefined ?
                      Session.get('userData')._id === this.props.userId ? undefined
                      : <div className="post__actions">
                          <img src="message.png" className="post__icon" onClick={this.sendMessage}/>
                          <div className="post__message">
                            <form onSubmit={this.sendMessage}>
                              {this.state.errorMessageType ? <p>{this.state.errorMessageType}</p> : undefined}
                              Public&nbsp;<input type="radio" name="messageType" value="public" onClick={() => {this.setState({errorMessageType:''})}}/>&nbsp;
                              Privat&nbsp;<input type="radio" name="messageType" value="privat" onClick={() => {this.setState({errorMessageType:''})}}/>
                              {this.state.errorMessage ? <p>{this.state.errorMessage}</p> : undefined}
                              <input type="text" placeholder="Scrie mesajul tau"
                                ref="message" onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                                    this.setState({errorMessage: ''});
                                                  }}}/>
                              <button>Trimite mesajul</button>
                            </form>
                          </div>
                        </div>
                    : undefined }
                  </div>
                  : <div className="post__info">
                      <div className="post__pin">
                        <img src="redPin.png" className="post__icon"/>
                        <div className="post__pinDetails red">
                          <p>Acest anunt nu mai este disponibil.</p>
                          {Session.get('userData')._id === this.props.userId ?
                            <button onClick={this.makePostActive}>Reactiveaza-l</button>
                          : undefined }
                        </div>
                      </div>
                    </div>
              }

            </div>
            {Session.get('userData') !== undefined ?
              Session.get('userData')._id === this.props.userId ? undefined
              : <div className="post__tags">
                  <div className="post__activeTag">
                    {Session.get('userData').personalInfo.yesList.includes(this.props._id) ?
                      <img src="greenBox.png" className="post__icon"/>
                      : <img src="greyBox.png" className="post__icon" /> }

                    <div className="post__inactiveTags">
                      {!Session.get('userData').personalInfo.yesList.includes(this.props._id) ?
                        <img src="greenBox.png" className="post__icon" onClick={this.addToYesList}/>
                      : <img src="greyBox.png" className="post__icon"
                        onClick={this.removeFromYesList} /> }
                    </div>
                  </div>
                </div>
            : undefined }

            <div className="post__counts">
              <div>
                {this.props.likesCount === 0 ? undefined : <div><img src="yes.png" className="post__icon"/> {this.props.likesCount}</div>}
              </div>
            </div>
          </div>

          {this.props.isAvailable || Session.get('userData')._id === this.props.userId ||
            (this.props.isBlocked && this.props.isBlockedBy === Session.get('userData')._id) ?
            <h2><Link className="post__title" to={this.state.link}>{this.props.title}</Link></h2>
          : <div>
              <h2>{this.props.title}</h2>
            </div>
          }

          {this.props.images.length > 0 ? <img src={this.props.images[0].src} className="post__image" /> : undefined}

          <table>
            <tbody>
              <tr>
                <th>Localitate</th>
                <th>Pret</th>
              </tr>
              <tr>
                <td>{this.props.city}</td>
                <td>{this.props.price}{this.props.currency}/{this.props.period}</td>
              </tr>
            </tbody>
          </table>
        </div>

        : undefined }
      </div>
    );
  }
}

PrivatePost.propTypes = {
  _id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
  isAvailable: PropTypes.bool.isRequired,
  isBusy: PropTypes.bool,
  likesCount: PropTypes.number.isRequired
};

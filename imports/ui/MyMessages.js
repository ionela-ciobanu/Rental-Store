import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import {Session} from 'meteor/session';
import React from 'react';
import moment from 'moment';

import {Messages} from '../api/messages';

export default class MyMessages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      userData: {},
      displayMessages: 'none',
      messages: [],
      usernames: [],
      contacts: null,
      contact: null,
      openedContact: null,
      unreadMessages: null
    };
    this.searchByUsername = this.searchByUsername.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getContacts = this.getContacts.bind(this);
    this.sortArray = this.sortArray.bind(this);
    this.goToByScroll = this.goToByScroll.bind(this);
    this.getUnreadMessages = this.getUnreadMessages.bind(this);
    this.startTracking = this.startTracking.bind(this);
  }

  componentDidMount() {
    Meteor.setTimeout(this.startTracking, 0);
  }

  startTracking() {
    var handle = Meteor.subscribe('userData');
    this.userTracker = Tracker.autorun(() => {
      if(handle.ready()) {
        const userData = Meteor.users.findOne({});
        this.setState({userData});
      }
    });
    var handleMessages = Meteor.subscribe('messages');
    this.messagesTracker = Tracker.autorun(() => {
      if(handleMessages.ready()) {
        const messages = Messages.find({isPublic: false}).fetch();
        messages.sort(this.sortArray);
        this.setState({messages});
        this.getContacts();
      }
    });

    var handleUsernames = Meteor.subscribe('usernames');
    this.usernamesTracker = Tracker.autorun(() => {
      if(handleUsernames.ready()) {
        const usernames = Meteor.users.find({_id: {$ne: Meteor.userId()}}).fetch();
        this.setState({usernames});
        this.getContacts();
      }
    });
  }

  componentWillUnmount() {
    this.userTracker.stop();
    this.messagesTracker.stop();
    this.usernamesTracker.stop();
  }

  getContacts() {
    const contacts = [];
    Meteor.setTimeout(() => {
      this.state.messages.map((message) => {
        if(Meteor.userId() === message.senderId) {
          const receiver = this.state.usernames.find((user) => {
            return user._id === message.receiverId;
          });
          if(!contacts.includes(receiver)) {
            contacts.push(receiver);
          }
        }
        if(Meteor.userId() === message.receiverId) {
          const sender = this.state.usernames.find((user) => {
            return user._id === message.senderId;
          });
          if(!contacts.includes(sender)) {
            contacts.push(sender);
          }
        }
      });
      this.setState({contacts});
      const unreadMessages = [];
      contacts.map((contact) => {
        const i = 0;
        this.state.messages.map((message) => {
          if(message.senderId === contact._id) {
            if(!message.read) {
              i++;
            }
          }
        });
        unreadMessages.push({contact, i});
      });
      this.setState({unreadMessages});
    }, 1000);
  }

  getUnreadMessages() {
    const count = 0;
    this.state.contacts.map((contact) => {
      this.state.unreadMessages.map((message) => {
        if(message.contact === contact) {
          count += message.i;
        }
      });
    });
    if(count > 0) {
      return <span>({count})</span>;
    }
    return '';
  }

  sortArray(message1, message2) {
    if(message1.timestamp > message2.timestamp) {
      return 1;
    }
    if(message1.timestamp < message2.timestamp) {
      return -1;
    }
    return 0;
  }

  searchByUsername() {
    const username = this.refs.username.value.trim();
    const exista = 0;
    if(username) {
      this.state.usernames.map((user) => {
        if(user.username === username) {
          exista = 1;
          if(!this.state.contacts.includes(user)) {
            this.state.contacts.push(user);
          }
          this.setState({openedContact: user, errorMessage: ''});
          this.refs.username.value = '';
        }
      });
      if(exista === 0) {
        this.setState({errorUsername: ' ', openedContact: null});
      }
    } else {
      this.setState({errorUsername: ' ', openedContact: null});
    }
  }

  sendMessage() {
    const message = this.refs.message.value.trim();
    if(message) {
      Meteor.call('messages.sendMessage', this.state.openedContact._id, '', message, false);
      this.setState({errorMessage: ''});
      this.refs.message.value = "";
    } else {
      this.setState({errorMessage: ' '});
    }
  }

  goToByScroll() {
    Meteor.setTimeout(() => {
      $("#conversation").scrollTop($('#sendMessage').offset().top);
    },500);
  }

  render () {
    return (
      <div className="account__function">
        {this.state.userData !== undefined ?
          this.state.userData.personalInfo !== undefined ?
          <div className="account__title" onClick={() => {this.state.displayMessages === 'none' ? this.setState({displayMessages: 'block'}) :
                                                                  this.setState({displayMessages: 'none'})}}>
            <h3>Mesajele mele {this.state.unreadMessages !== null && this.state.contacts !== null ?
                                this.getUnreadMessages()
                              : undefined }</h3>
            <img src={this.state.displayMessages === 'none' ? '/arrow-down.png' : '/arrow-up.png'}/>
          </div>
          : undefined
        : undefined }

        <div className="account__content" style={{display: this.state.displayMessages}}>

          <div>
            <div className="account__search">
              <input className={this.state.errorUsername ? 'error' : ''} list="usernames"
                ref="username" placeholder="Nume utilizator" onChange={(e) =>{if(e.target.value.trim()) {
                                                                                      this.setState({errorUsername: ''});
                                                                                    }}}/>
              <button onClick={this.searchByUsername}>Cauta</button>
            </div>

            <datalist id="usernames">
              {this.state.usernames !== undefined ?
                this.state.usernames.length > 0 ?
                  this.state.usernames.map((user) => {
                    return <option key={user.username}>{user.username}</option>
                  })
                : undefined
              : undefined }
            </datalist>

          </div>

          {this.state.contacts !== null ?
            this.state.contacts.length > 0 ?
              <div className="account__messages">
                <div className="account__contacts">
                  {this.state.contacts.map((contact) => {
                    return <p key={contact._id} className={this.state.openedContact !== null ?
                                                            contact._id === this.state.openedContact._id ? "contact__opened" : ""
                                                          : ''}
                      onClick={() => {
                        Meteor.call('messages.markRead', Meteor.userId(), contact._id);
                        this.setState({openedContact: contact});
                        this.goToByScroll();
                      }}>{contact.username}
                    {this.state.unreadMessages !== null ?
                      this.state.unreadMessages.map((unreadMessage) => {
                        if(unreadMessage.contact === contact) {
                          if(unreadMessage.i > 0) {
                            return <span key={unreadMessage.contact._id}>({unreadMessage.i})</span>;
                          }
                          return ;
                        }
                      })
                    : undefined }</p>
                    })}
                </div>
                <div id="conversation" className="account__conversation">
                  {this.state.openedContact !== null ?
                    <div>
                      {this.state.messages.map((message) => {
                        if(message.senderId === this.state.openedContact._id) {
                          return (
                            <div key={message._id} className="message__received">
                              <p><i>{moment(message.timestamp).format("DD/MM/YY HH:mm")}</i></p>
                              <p>{message.message}</p>
                            </div>
                          )
                        }
                        if(message.receiverId === this.state.openedContact._id) {
                          return (
                            <div key={message._id} className="message__sent">
                              <p><i>{moment(message.timestamp).format("DD/MM/YY HH:mm")}</i></p>
                              <p>{message.message}</p>
                            </div>
                          )
                        }
                      })}
                      <div className="message__send">
                        <input className={this.state.errorMessage ? 'error' : ''} type="text"
                          ref="message" placeholder="Mesajul tau" onChange={(e) =>{if(e.target.value.trim()) {
                                                                                  this.setState({errorMessage: ''});
                                                                                }}}/>
                        <button id="sendMessage" onClick={this.sendMessage}>Trimite</button>
                      </div>
                    </div>

                  : <p>Pentru a vedea o conversatie, alege un contact.</p> }
                </div>
              </div>
            : undefined
          : undefined }



        </div>
      </div>
    );
  }
}

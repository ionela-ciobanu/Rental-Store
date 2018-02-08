import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import React from 'react';
import Modal from 'react-modal';
import FlipMove from 'react-flip-move';

import PrivateHeader from './PrivateHeader';
import PrivatePost from './PrivatePost';
import MyMessages from './MyMessages';
import PersonalInfo from './PersonalInfo';
import MyPosts from './MyPosts';
import {Posts} from '../api/posts';

export default class MyAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteIsOpen : false,
      userData: null,
      posts: null
    }
    this.startTracking = this.startTracking.bind(this);
    this.getInterestedPosts = this.getInterestedPosts.bind(this);
  }

  componentDidMount() {
    Meteor.setTimeout(this.startTracking, 0);
  }

  componentWillUnmount() {
    this.userTracker.stop();
    this.allPostsTracker.stop();
  }

  startTracking() {
    var handleUserData = Meteor.subscribe('userData');
    this.userTracker = Tracker.autorun(() => {
      if(handleUserData.ready()) {
        this.setState({userData: Meteor.users.findOne({})});
      }
    });

    var handlePosts = Meteor.subscribe('posts');
    this.allPostsTracker = Tracker.autorun(() => {
      if(handlePosts.ready()) {
        this.setState({posts: Posts.find({}).fetch()});
      }
    });
  }

  getInterestedPosts() {
    var userPost;
    return this.state.userData.personalInfo.yesList.map((id) => {
      this.state.posts.map((post) => {
        if(post._id === id) {
          userPost = post;
        }
      });
      return <PrivatePost key={id} {...userPost}/>;
    });
  }

  render() {
    return (
      <div>
        <PrivateHeader title="Rental Store"/>

        <div className="page__content">

          <MyMessages/>
          <PersonalInfo/>
          <MyPosts/>


          {this.state.userData !== null && this.state.posts !== null ?
            this.state.userData.personalInfo !== undefined ?
            <div className="page__content">
              {this.state.userData.personalInfo.yesList.length > 0 ?
                <h2>Anunturi salvate</h2>
              : undefined}
              <FlipMove className="posts-list" maintainContainerHeight={true}>
                {this.getInterestedPosts()}
              </FlipMove>
            </div>
            : undefined
          : undefined }


          <div className="account__cancel">
            <button onClick={() => {this.setState({deleteIsOpen: true})}}>Dezactiveaza contul</button>
          </div>
        </div>

        <Modal
          isOpen={this.state.deleteIsOpen}
          contentLabel="Sterge contul"
          onRequestClose={() => {this.setState({deleteIsOpen: false})}}
          className="boxed-view__box"
          overlayClassName="boxed-view boxed-view--modal">
          <div>
            <h3>Odata cu contul, vor fi sterse toate anunturile si mesajele tale. Esti sigur ca vrei sa dezactivezi contul ?</h3>
            <div className="account__title">
              <button className="button" onClick={() => {
                this.state.posts.map((post) => {
                  if(post.userId === Meteor.userId()) {
                    if(post.isBlocked) {
                      Meteor.call('users.removeFromBlockedPosts', post._id, post.isBlockedBy);
                    }
                    Meteor.call('users.removeReferences', post._id);
                  }
                });
                Meteor.call('posts.deleteAllPosts', (err, res) => {
                  if(!err) {
                    Meteor.call('messages.deleteAllMessages', (err, res) => {
                      Meteor.call('users.deleteAccount');
                    });
                  }
                });
                this.setState({deleteIsOpen:false})}}>Dezactiveaza
              </button>
              <button className="button" onClick={() => {this.setState({deleteIsOpen: false})}}>Anuleaza</button>
            </div>
          </div>
        </Modal>

      </div>
    );
  }
}

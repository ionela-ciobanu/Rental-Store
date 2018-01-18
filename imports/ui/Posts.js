import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import React from 'react';
import {Tracker} from 'meteor/tracker';
import {Session} from 'meteor/session';
import FlipMove from 'react-flip-move';
import moment from 'moment';

import PrivateHeader from './PrivateHeader';
import PrivatePost from './PrivatePost';
import {Posts} from '../api/posts';

export default class PostsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };
    this.renderPostsListItems = this.renderPostsListItems.bind(this);
    this.getPeriod = this.getPeriod.bind(this);
    this.startTracking = this.startTracking.bind(this);
  }

  componentDidMount() {
    Meteor.setTimeout(this.startTracking, 0);
  }

  componentWillUnmount() {
    this.allPostsTracker.stop();
    this.userTracker.stop();
  }

  startTracking() {
    var handlePosts = Meteor.subscribe('posts');
    this.allPostsTracker = Tracker.autorun(() => {
      if(handlePosts.ready()) {
        this.setState({posts: Posts.find({}).fetch()});
      }
    });

    var handleUserData = Meteor.subscribe('userData');
    this.userTracker = Tracker.autorun(() => {
      if(handleUserData.ready()) {
        Session.set('userData', Meteor.users.findOne({}));
      }
    });
  }

  renderPostsListItems() {
    if(this.state.posts.length === 0) {
      return (
        <div>
          <p>Ne pare rau, nu am gasit niciun anunt.</p>
        </div>
      );
    }
    return this.state.posts.map((post) => {
      this.getPeriod(post);
      return <PrivatePost key={post._id} {...post}/>;
    });
  }

  getPeriod(post) {
    if(post.isBlocked) {
      const isBlocked = moment(this.props.isBlocked);
      const finish = isBlocked.add(30, 'minutes');
      const now = moment();
      if(now.isAfter(finish)) {
        Meteor.call('users.removeFromBlockedPosts', post._id, post.isBlockedBy);
        Meteor.call('posts.unblockPost', this.props._id);
      }
    }
  }

  render() {
    return (
      <div>
        <PrivateHeader title="Rental Store"/>
        <div className="page__content">
          <FlipMove className="posts-list" maintainContainerHeight={true}>
            {this.renderPostsListItems()}
          </FlipMove>
        </div>
      </div>
    );
  }
}

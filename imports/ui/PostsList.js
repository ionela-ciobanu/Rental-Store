import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import React from 'react';
import {Tracker} from 'meteor/tracker';
import {Session} from 'meteor/session';
import FlipMove from 'react-flip-move';
import moment from 'moment';

import PrivateHeader from './PrivateHeader';
import PrivatePost from './PrivatePost';
import SearchBar from './SearchBar';
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

  startTracking() {
    var handlePosts = Meteor.subscribe('posts');
    this.allPostsTracker = Tracker.autorun(() => {
      if(handlePosts.ready()) {
        const posts = Posts.find({
          userId: Session.get('showMyPosts') ? Meteor.userId() : {$ne: Meteor.userId()},
          city: Session.get('city') ? Session.get('city') : {$ne: ''},
          category: Session.get('category') ? Session.get('category') : {$ne: ''},
          title: Session.get('keyword') ? {$regex: ".*".concat(Session.get('keyword')).concat(".*")} : {$ne: ''},
          isAvailable: Session.get('isAvailable') ? true : {$ne: ''},
          currency: Session.get('currency') ? Session.get('currency') : {$ne: ''},
          price: Session.get('maxPrice') ? {$lt: Session.get('maxPrice')} : {$ne: 0}
        }).fetch();
        this.setState({posts});
      }
    });

    var handleUserData = Meteor.subscribe('userData');
    this.userTracker = Tracker.autorun(() => {
      if(handleUserData.ready()) {
        Session.set('userData', Meteor.users.findOne({}));
      }
    });

    Session.set('category', null);
    Session.set('keyword', null);
  }

  componentWillUnmount() {
    this.allPostsTracker.stop();
    this.userTracker.stop();
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
        <SearchBar posts={this.state.posts}/>
        <div className="page__content">
          <FlipMove className="posts-list" maintainContainerHeight={true}>
            {this.renderPostsListItems()}
          </FlipMove>
        </div>
      </div>
    );
  }
}

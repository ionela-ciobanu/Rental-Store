import {Meteor} from 'meteor/meteor';
import React from 'react';
import {Tracker} from 'meteor/tracker';
import {Session} from 'meteor/session';
import FlipMove from 'react-flip-move';

import {Posts} from '../api/posts';
import Post from './Post';

export default class PostsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };
    this.renderPostsListItems.bind(this);
  }
  componentDidMount() {
    this.postsTracker = Tracker.autorun(() => {
      Meteor.subscribe('posts');
      const posts = Posts.find({}).fetch();
      this.setState({posts});
    });
  }
  componentWillUnmount() {
    this.postsTracker.stop();
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
      return <Post key={post._id} {...post}/>;
    });
  }
  render() {
    return (
      <div>
        <FlipMove className="posts-list" maintainContainerHeight={true}>
          {this.renderPostsListItems()}
        </FlipMove>
      </div>
    );
  }
}

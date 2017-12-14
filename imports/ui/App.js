import React from 'react';
import {Meteor} from 'meteor/meteor';
import FlipMove from 'react-flip-move';

import {Posts} from '../api/posts';
import Post from './Post';
import PublicHeader from './PublicHeader';

export default class App extends React.Component {
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
      const posts = Posts.find({isAvailable: false}).fetch();
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
        <PublicHeader/>
        <div className="page__content">
          <h2>Aici poti vedea doar anunturile ocupate. Pentru a le vedea pe cele disponibile
          si pentru a adauga alte anunturi, autentifica-te.</h2>
          <FlipMove className="posts-list" maintainContainerHeight={true}>
            {this.renderPostsListItems()}
          </FlipMove>
        </div>
      </div>
    );
  }
}

import React from 'react';
import {Meteor} from 'meteor/meteor';
import FlipMove from 'react-flip-move';

import {Posts} from '../api/posts';
import PublicPost from './PublicPost';
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
    var handlePosts = Meteor.subscribe('posts');
    this.postsTracker = Tracker.autorun(() => {
      if(handlePosts.ready()) {
        this.setState({posts: Posts.find({}).fetch()});
      }
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
      return <PublicPost key={post._id} {...post}/>;
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

import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import React from 'react';
import {Tracker} from 'meteor/tracker';
import FlipMove from 'react-flip-move';
import moment from 'moment';
import {Redirect} from 'react-router-dom';

import NotFound from './NotFound';
import PrivateHeader from './PrivateHeader';
import {Posts} from '../api/posts';
import Post from './Post';

export default class PostsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: {}
    };
  }
  componentDidMount() {
    this.postsTracker = Tracker.autorun(() => {
      Meteor.subscribe('posts');
      const post = Posts.findOne({_id: this.props.match.params.id});
      this.setState({post});
    });
  }
  componentWillUnmount() {
    this.postsTracker.stop();
  }
  render() {
    return (
      <div>
        {!Meteor.userId() ? <Redirect to="/"/> :

          <div>
            <PrivateHeader title="Rental Store"/>
            <div className="page__content">

              <div className="page__element">
                {this.state.post !== undefined ?
                  <div>
                    <h2>{this.state.post.title}</h2>

                    <div className="post__details">
                      <p>Categorie: {this.state.post.category}</p>
                      <p>Descriere: {this.state.post.description}</p>
                      <p>Pret: {this.state.post.price}{this.state.post.currency}/{this.state.post.period}</p>
                      <p>Localitate: {this.state.post.city}</p>
                      <p>Publicat la: {this.state.post.publishedAt}</p>
                      <p>Disponibil: {this.state.post.isAvailable ? 'Da' : 'Nu'}</p>
                      <p>Blocat: {this.state.post.isBlocked ? moment(this.state.post.isBlocked).format("DD/MM/YYYY  HH:mm") : 'Nu' }</p>
                      <p>Ocupat: {this.state.post.isBusy ? moment(this.state.post.isBusy).format("DD/MM/YYYY  HH:mm") : 'Nu'}</p>
                      <p>Persoane interesate: {this.state.post.likesCount}</p>
                      <p>Persoane dezinteresate: {this.state.post.dislikesCount}</p>
                      {this.state.post.images === undefined ? undefined :
                        <div className="post__images">
                          {this.state.post.images.map((image) => {
                            return <img key={image.src} src={image.src}/>})}
                        </div>
                      }
                    </div>
                  </div>

                  : <h1>Nu am gasit niciun anunt.</h1>
                }
              </div>
            </div>
          </div>

        }

      </div>
    );
  }
}

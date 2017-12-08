import {Meteor} from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Link} from 'react-router-dom';

import PostDetails from './PostDetails';

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      link: ''
    }
  };
  componentDidMount() {
    this.setState({link: "/posts/".concat(this.props._id)});
  }
  componentWillUnmount() {
    this.setState({link: ''});
  }
  render() {
    return (
      <div className="post">
        <h2><Link className="post__title" to={this.state.link}>{this.props.title}</Link></h2>
        {this.props.images.length > 0 ? <img src={this.props.images[0].src} /> : undefined}

        <p>Pret: {this.props.price}{this.props.currency}/{this.props.period}</p>
        <p>Localitate: {this.props.city}</p>
      </div>
    );
  }
}

Post.propTypes = {
  _id: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  publishedAt: PropTypes.string.isRequired,
  isAvailable: PropTypes.bool.isRequired,
  isBlocked: PropTypes.string,
  isBusy: PropTypes.string,
  likesCount: PropTypes.number.isRequired,
  dislikesCount: PropTypes.number.isRequired
};

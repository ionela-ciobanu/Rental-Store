import {Meteor} from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Link} from 'react-router-dom';

export default class PublicPost extends React.Component {
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
      <div>
        <div className="post">

          <h2><Link className="post__title" to={this.state.link}>{this.props.title}</Link></h2>

          {this.props.images.length > 0 ? <img src={this.props.images[0].src} className="post__image" /> : undefined}

          <p>Pret: {this.props.price}{this.props.currency}/{this.props.period}</p>
          <p>Localitate: {this.props.city}</p>

          <div className="post__counts">
            <div className="post__count">
              {this.props.likesCount === 0 ? undefined : <div><img src="yes.png" className="post__icon"/> {this.props.likesCount}</div>}
            </div>
            <div className="post__count">
              {this.props.dislikesCount === 0 ? undefined : <div><img src="no.png" className="post__icon"/> {this.props.dislikesCount} </div>}
            </div>

          </div>

        </div>
      </div>
    );
  }
}

PublicPost.propTypes = {
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
  likesCount: PropTypes.number.isRequired,
  dislikesCount: PropTypes.number.isRequired
};

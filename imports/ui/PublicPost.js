import {Meteor} from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Link} from 'react-router-dom';

export default class PublicPost extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <div>
        <div className="post">

          <h2 className="post__title">{this.props.title}</h2>

          {this.props.images.length > 0 ? <img src={this.props.images[0].src} className="post__image" /> : undefined}

          <table>
            <tbody>
              <tr>
                <th>Localitate</th>
                <th>Pret</th>
              </tr>
              <tr>
                <td>{this.props.city}</td>
                <td>{this.props.price}{this.props.currency}/{this.props.period}</td>
              </tr>
            </tbody>
          </table>

          <div className="post__counts">
            <div className="post__count">
              {this.props.likesCount === 0 ? undefined : <div><img src="yes.png" className="post__icon"/> {this.props.likesCount}</div>}
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
  likesCount: PropTypes.number.isRequired
};

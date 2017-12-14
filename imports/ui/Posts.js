import React from 'react';

import PrivateHeader from './PrivateHeader';
import PostsList from './PostsList';

export default class Posts extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <PrivateHeader title="Rental Store"/>
        <div className="page__content">
          <PostsList/>
        </div>
      </div>
    );
  }
}

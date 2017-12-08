import React from 'react';
import {Link} from 'react-router-dom';

import PrivateHeader from './PrivateHeader';
import AddPost from './AddPost';
import PostsList from './PostsList';

export default () => {
  return (
    <div>
      <PrivateHeader title="Rental Store"/>
      <div className="page-content">
        <PostsList/>
      </div>
    </div>
  );
};

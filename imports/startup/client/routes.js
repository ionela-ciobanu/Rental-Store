import {Meteor} from 'meteor/meteor';
import {Redirect} from 'react-router';
import {Route, Router, Switch} from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import App from '../../ui/App';
import PostsList from '../../ui/PostsList';
import NotFound from '../../ui/NotFound';
import AddPost from '../../ui/AddPost';
import PostDetails from '../../ui/PostDetails';
import MyAccount from '../../ui/MyAccount';

const unauthenticatedPages = ['/'];
const authenticatedPages = ['/posts', '/addPost', '/myAccount'];
const customHistory = createBrowserHistory();


export const onAuthChange = (isAuthenticated) => {
  const pathname = customHistory.location.pathname.split('/');
  const path = pathname[0] + '/' + pathname[1];
  const isUnauthenticatedPage = unauthenticatedPages.includes(path);
  const isAuthenticatedPage = authenticatedPages.includes(path);

  if (isUnauthenticatedPage && isAuthenticated) {
    customHistory.replace('/posts');
  } else if (isAuthenticatedPage && !isAuthenticated) {
    customHistory.replace('/');
  }
}

export const routes = (
  <Router history={customHistory}>
      <Switch>
        <Route exact path='/' render={() => (Meteor.userId() ?
          ( <Redirect to="/posts"/> ) : ( <App/> ) ) } />

        <Route path='/posts/:id' component= {PostDetails}/>

        <Route path='/posts' render={() => (!Meteor.userId() ?
          ( <Redirect to="/"/> ) : ( <PostsList/> ) ) } />

        <Route path='/addPost' render={() => (!Meteor.userId() ?
          ( <Redirect to="/"/> ) : ( <AddPost/> ) ) } />

        <Route path='/myAccount' render={() => (!Meteor.userId() ?
          ( <Redirect to="/"/> ) : ( <MyAccount/> ) ) } />

        <Route render={() => (<NotFound/>)}/>
      </Switch>
  </Router>
);

import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Tracker} from 'meteor/tracker';
import ReactDOM from 'react-dom';

import {routes, onAuthChange} from '../imports/startup/client/routes';
import '../imports/startup/simple-schema-configuration.js';

Tracker.autorun(() => {
  const isAuthenticated = !!Meteor.userId();
  onAuthChange(isAuthenticated);
});

Meteor.startup(() => {
  Session.set({unreadMessages: 0, category: null, keyword: null, isAvailable: false, showMyPosts: false,
    currency: null, maxPrice: null, displayPersonal: 'none', city: null});
  ReactDOM.render(routes, document.getElementById('app'));
});

import { Meteor } from 'meteor/meteor';
import {WebApp} from 'meteor/webapp';

import {Posts} from '../imports/api/posts';
import '../imports/api/users';
import '../imports/api/emails';
import '../imports/api/messages';
import '../imports/startup/simple-schema-configuration.js';
import '../imports/startup/server';

Meteor.startup(() => {

});

import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import shortid from 'shortid';

export const Emails = new Mongo.Collection('emails');

if(Meteor.isServer) {
  Meteor.publish('emails', function(email) {
    return Emails.find({email});
  });
}

Meteor.methods({
  'emails.insertCodeRegistration'(email, codeRegistration) {
    if(Emails.find({email}).fetch().length == 0) {
      Emails.insert({
        email: email,
        codeRegistration: codeRegistration
      });
    } else {
      Emails.update({email}, {$set:
      {
        codeRegistration: codeRegistration
      }});
    }
  },
  'emails.insertCodeReset'(email, codeReset) {
    if(Emails.find({email}).fetch().length > 0) {
      Emails.update({email}, {$set:
      {
        codeReset: codeReset
      }});
    }
  }
});

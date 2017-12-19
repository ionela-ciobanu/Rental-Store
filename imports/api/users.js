import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import {Accounts} from 'meteor/accounts-base';
import { Email } from 'meteor/email'

Meteor.publish(
  'userData', function() {
     var currentUser;
     currentUser = this.userId;
     if (currentUser) {
         return Meteor.users.find({
             _id: currentUser
         }, {
         fields: {
             "emails": 1,
             "profile": 1,
             "personalInfo": 1
         }
        });
      } else {
        return this.ready();
      }
  }
);

Meteor.methods ({
  'users.update'(newInfos) {
    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $set: {personalInfo: newInfos}
    });
  }//,
  // 'sendEmail'(to, from, subject, text) {
  //   // Make sure that all arguments are strings.
  //   check([to, from, subject, text], [String]);
  //   // Let other method calls from the same client start running, without
  //   // waiting for the email sending to complete.
  //   this.unblock();
  //   Email.send({ to, from, subject, text });
  // }
});

Accounts.onCreateUser(function(options, user) {
   user.profile = options.profile || {};
   user.profile.birthday = options.birthday;

   const newInfos = {
     lastName: "",
     firstName: "",
     address: "",
     phone: ""
   };
   user.personalInfo = newInfos;

   return user;
});

Accounts.validateNewUser((user) => {
  const email = user.emails[0].address;

  new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    }
  }).validate({email});

  return true;
});

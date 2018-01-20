import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import {Accounts} from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import {Session} from 'meteor/session';
import shortid from 'shortid';

if (Meteor.isServer) {
  Meteor.publish('userData', function() {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    return Meteor.users.find({_id: Meteor.userId()},
      {
      fields: {
        "emails": 1,
        "username": 1,
        "profile": 1,
        "personalInfo": 1
      }
    });
  });
  Meteor.publish('userInfo', function(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    return Meteor.users.find({_id},
      {
      fields: {
        "emails": 1,
        "username": 1,
        "profile": 1,
        "personalInfo": 1
      }
    });
  });
  Meteor.publish('usernames', function() {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    return Meteor.users.find({_id: {$ne: Meteor.userId()}},
      {
      fields: {
        "_id": 1,
        "emails": 1,
        "username": 1,
        "personalInfo": 1
      }
    });
  });
}

Meteor.methods ({
  'users.update'(lastName, firstName, address, phone) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $set: {'personalInfo.lastName': lastName,
             'personalInfo.firstName': firstName,
             'personalInfo.address': address,
             'personalInfo.phone': phone
            }
    });
  },
  'users.resetPassword'(email, newPassword) {
    const user = Accounts.findUserByEmail(email);
    if(user) {
      Accounts.setPassword(user._id, newPassword);
    }
  },
  'sendEmail'(to, from, subject, text) {
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running, without waiting for the email sending to complete.
    this.unblock();
    try {
      Email.send({ to, from, subject, text });
    }
    catch (e) {
      throw new Error(`Email-ul catre ${to} NU a fost trimis.`);
    }
  },
  'users.addToYesList'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $addToSet: {'personalInfo.yesList' : _id }
    });
  },
  'users.removeFromYesList'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $pull: {'personalInfo.yesList': _id}
    });
  },
  'users.addToBlockedPosts'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $addToSet: {'personalInfo.blockedPosts': {_id}},
      $set: {'personalInfo.canBlock': false}
    });
  },
  'users.removeFromBlockedPosts'(_id, userId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(userId, {
      $pull: {'personalInfo.blockedPosts' : {_id}},
      $set: {'personalInfo.canBlock': true}
    });
  },
  'users.addToInactivePosts'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $addToSet: {'personalInfo.inactivePosts': {_id}}
    });
  },
  'users.removeFromInactivePosts'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $pull: {'personalInfo.inactivePosts': {_id}}
    });
  },
  'users.addSearch'(city, category, keyword, maxPrice, currency) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $addToSet: {'personalInfo.searchCriteria': {city, category, keyword, maxPrice, currency}}
    });
  },
  'users.removeReferences'(postId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update({}, {$pull: {'personalInfo.yesList': postId}},
      {$pull: {'personalInfo.blockedPosts': postId}});
  },
  'users.deleteAccount'() {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.remove(Meteor.userId());
  }
});

Accounts.onCreateUser(function(options, user) {
   user.profile = options.profile || {};
   user.profile.birthday = options.birthday;
   user.emails[0].verified = true;
   user.username = options.username;

   const newInfos = {
     lastName: "",
     firstName: "",
     address: "",
     phone: "",
     yesList: [],
     blockedPosts: [],
     canBlock: true,
     inactivePosts: [],
     searchCriteria: [{city: '', category: '', keyword: '', maxPrice: '', currency: ''}]
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

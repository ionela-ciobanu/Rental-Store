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
    return Meteor.users.find({_id: this.userId},
      {
      fields: {
        "emails": 1,
        "profile": 1,
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
      console.log(`Parola utilizatorului ${email} a fost schimbata cu succes.`);
    }
  },
  'sendEmail'(to, from, subject, text) {
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running, without waiting for the email sending to complete.
    this.unblock();
    try {
      Email.send({ to, from, subject, text });
      console.log(`Email-ul catre ${to} a fost trimis.`);
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
      $addToSet: {'personalInfo.yesList' : _id },
      $pull: {'personalInfo.noList': _id}
    });
  },
  'users.addToNoList'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $addToSet: {'personalInfo.noList': _id},
      $pull: {'personalInfo.yesList': _id}
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
  'users.removeFromNoList'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $pull: {'personalInfo.noList': _id}
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
  'users.sendPublicMessage'(message, _id, receiverId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $addToSet: {'personalInfo.sentMessages': {message, receiverId, read: false, isPublic: true, postId: _id}}
    });
    Meteor.users.update({_id: receiverId}, {
      $inc: {'personalInfo.newMessagesCount': 1},
      $addToSet: {'personalInfo.receivedMessages': {message, senderId: Meteor.userId(), read: false, isPublic: true, postId: _id}}
    });
  },
  'users.sendMessage'(message, receiverId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(Meteor.userId(), {
      $addToSet: {'personalInfo.sentMessages': {message, receiverId, read: false, isPublic: false}}
    });
    Meteor.users.update({_id: receiverId}, {
      $inc: {'personalInfo.newMessagesCount': 1},
      $addToSet: {'personalInfo.receivedMessages': {message, senderId: Meteor.userId(), read: false, isPublic: false}}
    });
  }
});

Accounts.onCreateUser(function(options, user) {
   user.profile = options.profile || {};
   user.profile.birthday = options.birthday;
   user.emails[0].verified = true;

   const newInfos = {
     lastName: "",
     firstName: "",
     address: "",
     phone: "",
     yesList: [],
     noList: [],
     blockedPosts: [],
     canBlock: true,
     inactivePosts: [],
     receivedMessages: [],
     sentMessages: [],
     newMessagesCount: 0
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

import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import shortid from 'shortid';

export const Messages = new Mongo.Collection('messages');

if(Meteor.isServer) {
  Meteor.publish('messages', function() {
    return Messages.find({
      $or : [{senderId: Meteor.userId(), isPublic: false},
             {receiverId: Meteor.userId(), isPublic: false}]});
  });
  Meteor.publish('publicMessages', function() {
    return Messages.find({receiverId: Meteor.userId(), isPublic: true});
  });
  Meteor.publish('allMyMessages', () => {
    return Messages.find({receiverId: Meteor.userId()});
  });
  Meteor.publish('postMessages', function(postId) {
    return Messages.find({postId, isPublic: true});
  });
}

Meteor.methods({
  'messages.sendMessage'(receiverId, postId, message, isPublic) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Messages.insert({
      _id: shortid.generate(),
      senderId: Meteor.userId(),
      senderUsername: Meteor.user().username,
      receiverId,
      postId,
      message,
      read: receiverId === Meteor.userId() ? true : false,
      isPublic,
      timestamp: new Date().getTime()
    });
  },
  'messages.markRead'(receiverId, senderId) {
    Messages.update({receiverId, senderId, isPublic: false}, {$set: {read: true}}, {multi: true});
  }
});

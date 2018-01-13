import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import shortid from 'shortid';
import moment from 'moment';

export const Posts = new Mongo.Collection('posts');

if(Meteor.isServer) {
  Meteor.publish('posts', function() {
    return Posts.find({});
  });
  Meteor.publish('userPosts', function() {
    let userId = Meteor.userId();
    if(userId) {
      return Posts.find({userId: userId});
    }
  });
}

Meteor.methods({

  'posts.insert'(title, category, description, price, currency, period, city, images) {
    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.insert({
      _id: shortid.generate(),
      userId: this.userId,
      title,
      category,
      description,
      price,
      currency,
      period,
      city,
      images,
      publishedAt: moment().format("DD/MM/YYYY HH:mm"),
      isAvailable: true,
      isBlocked: null,
      isBusy: false,
      likesCount: 0,
      dislikesCount: 0,
      dislikesReasons: [],
      publicMessages: []
    });
  },
  'posts.update'(_id, images, title, category, description, price,
                 currency, period, city) {
    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$set:
      {
        images: images,
        title: title,
        category: category,
        description: description,
        price: price,
        currency: currency,
        period: period,
        city: city
      }});
  },
  'posts.delete'(_id) {
    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.remove({_id});
  },
  'posts.incrementLikesCount'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$inc: {likesCount: 1}});
  },
  'posts.incrementDislikesCount'(_id, reason) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    const dislikeReason = {'userId': Meteor.userId(), 'reason': reason};
    Posts.update({_id}, {$inc: {dislikesCount: 1},
      $addToSet: {dislikesReasons: dislikeReason}});
  },
  'posts.decrementLikesCount'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$inc: {likesCount: -1}});
  },
  'posts.decrementDislikesCount'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$inc: {dislikesCount: -1},
      $pull: {dislikesReasons: {userId: Meteor.userId()}}});
  },
  'posts.blockPost'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$set: {isAvailable: false,
      isBlocked: new Date().getTime(), isBlockedBy: Meteor.userId()}});
  },
  'posts.unblockPost'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$set: {isAvailable: true, isBlocked: null, isBlockedBy: null}});
  },
  'posts.makePostInactive'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$set: {isAvailable: false, isBusy: true}});
  },
  'posts.makePostActive'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$set: {isAvailable: true, isBusy: false}});
  },
  'posts.addPublicMessage'(message, _id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$addToSet: {publicMessages: {message, senderId: Meteor.userId(), read: false}}});
  }
});

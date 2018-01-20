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
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    return Posts.find({userId: Meteor.userId()});
  });
}

Meteor.methods({

  'posts.insert'(title, category, description, price, currency, period, city, images, details) {
    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    let _id = shortid.generate();
    Posts.insert({
      _id,
      userId: this.userId,
      title,
      category,
      description,
      price,
      currency,
      period,
      city,
      images,
      details,
      publishedAt: moment().format("DD/MM/YYYY HH:mm"),
      isAvailable: true,
      isBlocked: null,
      isBusy: false,
      likesCount: 0,
      publicMessages: []
    });
    return _id;
  },
  'posts.update'(_id, images, title, description, price,
                 currency, period, city, details) {
    if(!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$set:
      {
        images,
        title,
        description,
        price,
        currency,
        period,
        city,
        details
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
  'posts.decrementLikesCount'(_id) {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.update({_id}, {$inc: {likesCount: -1}});
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
  'posts.deleteAllPosts'() {
    if(!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Posts.remove({userId: Meteor.userId()});
  }
});

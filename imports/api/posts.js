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
      isBusy: null,
      likesCount: 0,
      dislikesCount: 0
    });
  }

});

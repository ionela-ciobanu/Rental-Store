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
      isBusy: null,
      likesCount: 0,
      dislikesCount: 0
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
  }

});

import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Tracker} from 'meteor/tracker';
import React from 'react';
import FlipMove from 'react-flip-move';
import {Redirect} from 'react-router-dom';
import Gallery from 'react-grid-gallery';
import moment from 'moment';

import NotFound from './NotFound';
import PrivateHeader from './PrivateHeader';
import {Posts} from '../api/posts';
import {Messages} from '../api/messages';

export default class PostDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: {},
      data: {},
      messages: [],
      period: '',
      showAuto: 'none',
      showStare: 'none',
      showApartamente: 'none',
      showSuprafata: 'none',
      showImbracaminte: 'none'
    };
    this.blockPost = this.blockPost.bind(this);
    this.unblockPost = this.unblockPost.bind(this);
    this.makePostInactive = this.makePostInactive.bind(this);
    this.makePostActive = this.makePostActive.bind(this);
    this.getPeriod = this.getPeriod.bind(this);
    this.addToYesList = this.addToYesList.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.removeFromYesList = this.removeFromYesList.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.startTracking = this.startTracking.bind(this);
  }
  componentDidMount() {
    Meteor.setTimeout(this.startTracking, 0);
  }

  startTracking() {
    const handlePosts = Meteor.subscribe('posts');
    var post;
    Meteor.setTimeout(() => {
      if(handlePosts.ready()) {
        post = Posts.findOne({_id: this.props.match.params.id});
        this.getUserInfo(post.userId);
        if(post.isBlocked) {
          this.getPeriod();
        }
      }
    }, 1000);

    this.postsTracker = Tracker.autorun(() => {
      if(handlePosts.ready()) {
        post = Posts.findOne({_id: this.props.match.params.id});
        this.setState({post});
        switch (post.category) {
          case 'Autoturisme':
          case 'Autoutilitare':
          case 'Camioane':
          case 'Remorci': this.setState({showAuto: 'block'});
                          break;
          case 'Echipamente audio':
          case 'Echipamente video':
          case 'Echipamente foto':
          case 'Echipamente sportive':
          case 'Alte echipamente':
          case 'Mobila':
          case 'Unelte':
          case 'Accesorii': this.setState({showStare: 'block'})
                            break;
          case 'Apartamente':
          case 'Vile':  this.setState({showApartamente: 'block'});
                        break;
          case 'Terenuri':
          case 'Garaje':
          case 'Spatii comerciale':
          case 'Alte proprietati':  this.setState({showSuprafata: 'block'});
                                    break;
          case 'Imbracaminte universala':
          case 'Imbracaminte dama':
          case 'Imbracaminte barbati':
          case 'Imbracaminte copii':  this.setState({showImbracaminte: 'block'});
                                      break;
        };
        const handlePostMessages = Meteor.subscribe('postMessages', post._id);
        if(handlePostMessages.ready()) {
          const messages = Messages.find({postId: post._id, isPublic: true}).fetch();
          this.setState({messages});
        }
      }
    });
    const handleData = Meteor.subscribe('userData');
    this.dataTracker = Tracker.autorun(() => {
      if(handleData.ready()) {
        const data = Meteor.users.findOne({});
        this.setState({data});
      }
    });
  }

  componentWillUnmount() {
    this.postsTracker.stop();
    this.dataTracker.stop();
    // this.messagesTracker.stop();
    Meteor.clearInterval(this.myInterval);
  }

  addToYesList() {
    Meteor.call('users.addToYesList', this.state.post._id);
    Meteor.call('posts.incrementLikesCount', this.state.post._id);

    Meteor.call('sendEmail', this.state.userInfo.emails[0].address, 'support@rentalstore.com', 'Rental Store - Cineva este interesat de anuntul tau.',
      `${Meteor.user().username} este interesat de anuntul tau cu codul ${this.state.post._id}.`);
  }

  removeFromYesList() {
    Meteor.call('users.removeFromYesList', this.state.post._id);
    Meteor.call('posts.decrementLikesCount', this.state.post._id);
  }

  getPeriod() {
    Meteor.setTimeout(() => {
      const isBlocked = moment(this.state.post.isBlocked);
      const finish = isBlocked.add(30, 'minutes');
      this.myInterval = Meteor.setInterval(() => {
        const now = moment();
        const after = now.isAfter(finish);
        if(after || !this.state.post.isBlocked) {
          this.setState({period: ''});
          this.unblockPost();
          Meteor.clearInterval(this.myInterval);
        } else {
          const diff = moment.utc(moment(finish, "HH:mm:ss").diff(moment(now,"HH:mm:ss"))).format("mm:ss");
          this.setState({period: diff});
        }
      }, 1000);
    },100);
  }

  sendMessage(e) {
    e.preventDefault();
    const message = this.refs.message.value.trim();
    const messageType = e.target.messageType.value;
    const error = false;
    if(message.length < 4) {
      this.setState({errorMessage: 'Mesajul este prea scurt.'});
      error = true;
    }
    if(!messageType) {
      this.setState({errorMessageType: 'Selecteaza tipul mesajului.'});
      error = true;
    }
    if(!error) {
      this.setState({errorMessageType: ''});
      if(this.state.data.personalInfo.firstName && this.state.data.personalInfo.lastName
        && this.state.data.personalInfo.address && this.state.data.personalInfo.phone) {

          if(messageType === 'public') {
            Meteor.call('messages.sendMessage', this.state.post.userId, this.state.post._id, message, true);
            e.target.reset();
          } else {
            Meteor.call('messages.sendMessage', this.state.post.userId, null, message, false);
            e.target.reset();
          }

      } else {
        alert('Pentru a trimite un mesaj, completeaza informatiile personale.');
      }
    }
  }

  blockPost() {
    Meteor.call('users.addToBlockedPosts', this.state.post._id);
    Meteor.call('posts.blockPost', this.state.post._id);
    this.getPeriod();

    Meteor.call('sendEmail', this.state.userInfo.emails[0].address, 'support@rentalstore.com', 'Rental Store - Anuntul tau a fost blocat.',
      `${Meteor.user().username} a blocat anuntul tau cu codul ${this.state.post._id}.`);
  }

  unblockPost() {
    Meteor.call('users.removeFromBlockedPosts', this.state.post._id, this.state.post.isBlockedBy);
    Meteor.call('posts.unblockPost', this.state.post._id);
    this.setState({period: ''});
    Meteor.clearInterval(this.myInterval);
  }

  makePostActive() {
    Meteor.call('users.removeFromInactivePosts', this.state.post._id);
    Meteor.call('posts.makePostActive', this.state.post._id);
  }

  makePostInactive() {
    Meteor.call('users.addToInactivePosts', this.state.post._id);
    Meteor.call('posts.makePostInactive', this.state.post._id);
  }

  getUserInfo(_id) {
    const handle = Meteor.subscribe('userInfo', _id);
    var userInfo;
    Meteor.setTimeout(() => {
      if(handle.ready()) {
        userInfo = Meteor.users.findOne({_id});
        this.setState({userInfo});
      }
    }, 1000);
  }

  render() {
    return (
      <div>
        {!Meteor.userId() ? <Redirect to="/"/> :

          <div>
            <PrivateHeader title="Rental Store"/>
            <div className="page__content">

            {this.state.post !== undefined && this.state.data !== undefined ?
              this.state.post.isAvailable || this.state.post.isBlockedBy === this.state.data._id ||
                 this.state.post.userId === this.state.data._id ?
              <div className="page__element">

                {this.state.data.personalInfo !== undefined ?
                  <div className="post__header yellow">

                    <div className="post__pins">
                      {this.state.post.isAvailable ?
                        <div className="post__info">
                          <div className="post__pin">
                            <img src="../greenPin.png" className="post__icon"/>
                            <div className="post__pinDetails green">
                              {this.state.data._id === this.state.post.userId ?
                                <div>
                                  <p>Anuntul meu</p>
                                  <button onClick={this.makePostInactive}>Dezactiveaza anuntul</button>
                                </div>
                                : this.state.data.personalInfo.canBlock ?
                                  <div>
                                    <p>Acest anunt este disponibil. Ai posibilitatea de a-l bloca pentru 30 de minute,
                                      timp in care doar tu vei vedea detaliile acestuia. Profita de ocazie pentru a
                                      ajunge la un consens cu posesorul anuntului.</p>
                                    <button onClick={this.blockPost}>Blocheaza anuntul</button>
                                  </div>
                              : <p>Acest anunt este disponibil. Nu poti bloca alte anunturi !</p>
                              }
                            </div>
                          </div>
                        </div>
                        : this.state.post.isBlocked !== null ?
                        <div className="post__info">
                          <div className="post__pin">
                            <img src="../pinkPin.png" className="post__icon"/>
                            <div className="post__pinDetails pink">
                              {this.state.data._id === this.state.post.userId ?
                                <p>Anuntul meu este blocat.</p>
                                : <p>Acest anunt este blocat.</p>
                              }
                              {this.state.period ? this.state.period : undefined}
                              {this.state.data.personalInfo.blockedPosts.length > 0 ?
                                this.state.data.personalInfo.blockedPosts[0]._id === this.state.post._id ?
                                  <button onClick={this.unblockPost}>Deblocheaza anuntul</button>
                                : undefined : undefined }
                            </div>
                          </div>
                          {this.state.period ? <p>{this.state.period}</p> : undefined}
                        </div>
                        : <div className="post__info">
                            <div className="post__pin">
                              <img src="../redPin.png" className="post__icon"/>
                              <div className="post__pinDetails red">
                                <p>Acest anunt nu mai este disponibil.</p>
                                {this.state.data._id === this.state.post.userId ?
                                  <button onClick={this.makePostActive}>Reactiveaza-l</button>
                                : undefined }
                              </div>
                            </div>
                          </div>
                      }
                    </div>

                    {this.state.data._id === this.state.post.userId ? undefined
                    : <div className="post__tags">
                        <div className="post__activeTag">
                          {this.state.data.personalInfo.yesList.includes(this.state.post._id) ?
                            <img src="../greenBox.png" className="post__icon"/>
                            : <img src="../greyBox.png" className="post__icon" /> }

                          <div className="post__inactiveTags">
                            {!this.state.data.personalInfo.yesList.includes(this.state.post._id) ?
                              <img src="../greenBox.png" className="post__icon" onClick={this.addToYesList}/>
                            : <img src="../greyBox.png" className="post__icon"
                              onClick={this.removeFromYesList} /> }
                              <div className="post__no">
                                {this.state.data.personalInfo.yesList.includes(this.state.post._id) ?
                                  <i>Nu ma intereseaza</i>
                                : <i>Ma intereseaza</i>}
                              </div>
                          </div>
                          <div className="post__yes">
                            {this.state.data.personalInfo.yesList.includes(this.state.post._id) ?
                              <i>Ma intereseaza</i>
                            : <i>Nu ma intereseaza</i>}
                          </div>

                        </div>
                      </div>
                    }

                    <div className="post__counts">
                      <div>
                        {this.state.post.likesCount === 0 ? undefined : <div><img src="../yes.png" className="post__icon"/> {this.state.post.likesCount}</div>}
                      </div>
                    </div>
                    <div>
                      <p><i>categorie: {this.state.post.category}</i></p>
                      <p><i>publicat de {this.state.userInfo !== undefined ?
                        this.state.data._id !== this.state.userInfo._id ? this.state.userInfo.username + " " + this.state.userInfo.personalInfo.phone : 'mine' : undefined}</i></p>
                      <p><i>{this.state.post.publishedAt}</i></p>
                    </div>
                  </div>
                : undefined }


                <div className="first__section">
                  <h2>{this.state.post.title}</h2>
                  <h2>{this.state.post.city}</h2>
                  <h2><i>{this.state.post.price}{this.state.post.currency}/{this.state.post.period}</i></h2>
                </div>

                <div>
                  {this.state.post.images !== undefined?
                    this.state.post.images.length > 0 ?
                      <Gallery images={this.state.post.images} backdropClosesModal={true} enableLightbox={true} enableImageSelection={false}/>
                    : undefined
                  : undefined}
                </div>

                <div className="post__description">
                  <div className="post__text">
                    <p>{this.state.post.description}</p>
                  </div>
                  <div className="post__particular">

                    <div style={{display: this.state.showAuto}}>
                      {this.state.post.details !== undefined ?
                        <table>
                          <tbody>
                            <tr>
                              <td>Marca</td>
                              <td>{this.state.post.details.marca}</td>
                            </tr>
                            <tr>
                              <td>Model</td>
                              <td>{this.state.post.details.model}</td>
                            </tr>
                            <tr>
                              <td>Combustibil</td>
                              <td>{this.state.post.details.combustibil}</td>
                            </tr>
                            <tr>
                              <td>Anul fabricatiei</td>
                              <td>{this.state.post.details.anFabricatie}</td>
                            </tr>
                            <tr>
                              <td>Rulaj</td>
                              <td>{this.state.post.details.rulaj} km</td>
                            </tr>
                            <tr>
                              <td>Capacitate cilindrica</td>
                              <td>{this.state.post.details.capacitate} cm<sup>3</sup></td>
                            </tr>
                          </tbody>
                        </table>
                      : undefined }
                    </div>

                    <div style={{display: this.state.showStare}}>
                      {this.state.post.details !== undefined ?
                        <table>
                          <tbody>
                            <tr>
                              <td>Stare</td>
                              <td>{this.state.post.details.stare}</td>
                            </tr>
                          </tbody>
                        </table>
                      : undefined }
                    </div>

                    <div style={{display: this.state.showApartamente}}>
                      {this.state.post.details !== undefined ?
                        <table>
                          <tbody>
                            <tr>
                              <td>Numarul camerelor</td>
                              <td>{this.state.post.details.camere}</td>
                            </tr>
                            <tr>
                              <td>Suprafata</td>
                              <td>{this.state.post.details.suprafataApartament} m<sup>2</sup></td>
                            </tr>
                          </tbody>
                        </table>
                      : undefined }
                    </div>

                    <div style={{display: this.state.showSuprafata}}>
                      {this.state.post.details !== undefined ?
                        <table>
                          <tbody>
                            <tr>
                              <td>Suprafata</td>
                              <td>{this.state.post.details.suprafata} m<sup>2</sup></td>
                            </tr>
                          </tbody>
                        </table>
                      : undefined }
                    </div>

                    <div style={{display: this.state.showImbracaminte}}>
                      {this.state.post.details !== undefined ?
                        <table>
                          <tbody>
                            <tr>
                              <td>Marime</td>
                              <td>{this.state.post.details.marime}</td>
                            </tr>
                            <tr>
                              <td>Stare</td>
                              <td>{this.state.post.details.stareImbracaminte}</td>
                            </tr>
                          </tbody>
                        </table>
                      : undefined }
                    </div>
                  </div>
                </div>

                <div className="post__publicMessages">
                  {this.state.messages.length > 0 ?
                    this.state.messages.map((message) => {
                      return (
                        <div key={message._id} className="post__publicMessage">
                          <p>{moment(message.timestamp).format("DD/MM/YYYY HH:mm")}</p>
                          <p>{message.senderId === Meteor.userId() ? 'Eu' : message.senderUsername} : {message.message}</p>
                        </div>
                      )
                    })
                  : <i>Nu sunt mesaje pentru acest anunt.</i> }
                </div>
                {this.state.data.personalInfo !== undefined ?
                  <div className="contact">
                    <form className="form__send" onSubmit={this.sendMessage}>
                      {this.state.errorMessage ? <p>{this.state.errorMessage}</p> : undefined}
                      <textarea className="textarea" ref="message" placeholder="Mesajul tau"
                        onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                            this.setState({errorMessage: ''});
                                          }}}></textarea>
                      {this.state.errorMessageType ? <p>{this.state.errorMessageType}</p> : undefined}
                      <div className="message__type">
                        <div>
                          Public&nbsp;<input type="radio" name="messageType" value="public" onClick={() => {this.setState({errorMessageType:''})}}/>&nbsp;
                        </div>
                        <div>
                          Privat&nbsp;<input type="radio" name="messageType" value="privat" onClick={() => {this.setState({errorMessageType:''})}}/>
                        </div>
                      </div>

                      <button>Trimite mesajul</button>
                    </form>
                  </div>
                : undefined }


                    {/* <div className="post__details">
                      <p>Categorie: {this.state.post.category}</p>
                      <p>Descriere: {this.state.post.description}</p>
                      <p>Pret: {this.state.post.price}{this.state.post.currency}/{this.state.post.period}</p>
                      <p>Localitate: {this.state.post.city}</p>
                      <p>Publicat la: {this.state.post.publishedAt}</p>
                      <p>Disponibil: {this.state.post.isAvailable ? 'Da' : 'Nu'}</p> */}
                      {/* <p>Blocat: {this.state.post.isBlocked ? moment(this.state.post.isBlocked).format("DD/MM/YYYY  HH:mm") : 'Nu' }</p>
                      <p>Ocupat: {this.state.post.isBusy ? moment(this.state.post.isBusy).format("DD/MM/YYYY  HH:mm") : 'Nu'}</p> */}
                      {/* <p>Persoane interesate: {this.state.post.likesCount}</p>
                      <p>Persoane dezinteresate: {this.state.post.dislikesCount}</p>
                      {this.state.post.images === undefined ? undefined :
                        <div className="post__images">
                          {this.state.post.images.map((image) => {
                            return <img key={image.src} src={image.src}/>})}
                        </div>
                      }
                    </div> */}

              </div>
              : <div className="page__element">
                <h2>Acest anunt este blocat !</h2>
                </div>
            : undefined
            }

            </div>
          </div>

        }

      </div>
    );
  }
}

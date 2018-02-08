import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import React from 'react';
import Modal from 'react-modal';
import Dropzone from 'react-dropzone';
import Gallery from 'react-grid-gallery';
import {Link} from 'react-router-dom';
import axios from 'axios';

import {Messages} from '../api/messages';
import {Posts} from '../api/posts';

export default class MyPosts extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      error: '',
      files: [],
      images: [],
      selected: [],
      cloudinaryImages: [],
      displayPosts: 'none',
      posts: [],
      post: {},
      isOpen: false,
      deleteIsOpen: false,
      showAuto: 'none',
      showStare: 'none',
      showApartamente: 'none',
      showSuprafata: 'none',
      showImbracaminte: 'none',
      publicMessages: [],
      postMessages: null,
      unreadMessages: null
    }
    this.onSubmit = this.onSubmit.bind(this);
    this.onImageDrop = this.onImageDrop.bind(this);
    this.uploadImagesToCloudinary = this.uploadImagesToCloudinary.bind(this);
    this.onSelectImage = this.onSelectImage.bind(this);
    this.getSelectedImages = this.getSelectedImages.bind(this);
    this.removeImages = this.removeImages.bind(this);
    this.setSelectedToFalse = this.setSelectedToFalse.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.getPostMessages = this.getPostMessages.bind(this);
    this.startTracking = this.startTracking.bind(this);
  }

  componentDidMount() {
    Meteor.setTimeout(this.startTracking, 0);
  }

  startTracking() {
    const handlePosts = Meteor.subscribe('userPosts');
    this.postsTracker = Tracker.autorun(() => {
      if(handlePosts.ready()) {
        const posts = Posts.find({userId: Meteor.userId()}).fetch();
        this.setState({posts});
      }
    });

    var handlePublicMessages = Meteor.subscribe('publicMessages');
    this.publicMessagesTracker = Tracker.autorun(() => {
      if(handlePublicMessages.ready()) {
        const publicMessages = Messages.find({receiverId: Meteor.userId(), isPublic: true}).fetch();
        this.setState({publicMessages});
        this.getPostMessages();
      }
    });
  }

  componentWillUnmount() {
    this.postsTracker.stop();
    this.publicMessagesTracker.stop();
  }

  onSubmit(e) {
    e.preventDefault();
    this.setSelectedToFalse();

    let title = this.refs.title.value.trim();
    var details = {};
    let description = this.refs.description.value.trim();
    let price = this.refs.price.value;
    let currency = this.refs.currency.value;
    let period = this.refs.period.value;
    let city = this.refs.city.value.trim();

    let images = this.state.images;
    let allImages = [];
    let files = this.state.files;

    const error = false;

    if(title.length < 4) {
      this.setState({errorTitle: 'Titlul trebuie sa contina cel putin 4 caractere.'});
      error = true;
    }
    if(description.length < 4) {
      this.setState({errorDescription: 'Descrierea trebuie sa contina cel putin 4 caractere.'});
      error = true;
    }
    if(price < 1) {
      this.setState({errorPrice: 'Pretul nu este corect.'});
      error = true;
    }
    if(!currency) {
      this.setState({errorCurrency: 'Alege moneda'});
      error = true;
    }
    if(!period) {
      this.setState({errorPeriod: 'Alege perioada.'});
      error = true;
    }
    if(city.length < 3) {
      this.setState({errorCity: 'Localitatea trebuie sa contina cel putin 3 caractere.'});
      error = true;
    }
    switch (this.state.post.category) {
      case 'Autoturisme':
      case 'Autoutilitare':
      case 'Camioane':
      case 'Remorci': {
        let marca = this.refs.marca.value.trim();
        let model = this.refs.model.value.trim();
        let combustibil = this.refs.combustibil.value.trim();
        let anFabricatie = this.refs.anFabricatie.value;
        let rulaj = this.refs.rulaj.value;
        let capacitate = this.refs.capacitate.value;
        details = {marca, model, combustibil, anFabricatie, rulaj, capacitate};

        if(marca.length < 2) {
          this.setState({errorMarca: 'Introdu marca.'});
          error = true;
        }
        if(model.length < 2) {
          this.setState({errorModel: 'Introdu modelul.'});
          error = true;
        }
        if(combustibil.length < 2) {
          this.setState({errorCombustibil: 'Introdu combustibilul.'});
          error = true;
        }
        if(!anFabricatie) {
          this.setState({errorAnFabricatie: 'Introdu data fabricatiei.'});
          error = true;
        }
        if(rulaj < 1) {
          this.setState({errorRulaj: 'Introdu rulajul.'});
          error = true;
        }
        if(capacitate < 1) {
          this.setState({errorCapacitate: 'Introdu capacitatea.'});
          error = true;
        }
        break;
      }
      case 'Echipamente audio':
      case 'Echipamente video':
      case 'Echipamente foto':
      case 'Echipamente sportive':
      case 'Alte echipamente':
      case 'Mobila':
      case 'Unelte':
      case 'Accesorii': {
        let stare = this.refs.stare.value;
        details = {stare};
        if(!stare) {
          this.setState({errorStare: 'Alege starea.'});
          error = true;
        }
        break;
      }
      case 'Apartamente':
      case 'Vile': {
        let camere = this.refs.camere.value;
        let suprafataApartament = this.refs.suprafataApartament.value;
        details = {camere, suprafataApartament};
        if(!camere) {
          this.setState({errorCamere: 'Alege numarul de camere.'});
          error = true;
        }
        if(suprafataApartament < 10) {
          this.setState({errorSuprafataApartament: 'Introdu suprafata corecta.'});
          error = true;
        }
        break;
      }
      case 'Terenuri':
      case 'Garaje':
      case 'Spatii comerciale':
      case 'Alte proprietati': {
        let suprafata = this.refs.suprafata.value;
        details = {suprafata};
        if(suprafata < 1) {
          this.setState({errorSuprafata: 'Introdu suprafata corecta.'});
        }
        break;
      }
      case 'Imbracaminte universala':
      case 'Imbracaminte dama':
      case 'Imbracaminte barbati':
      case 'Imbracaminte copii': {
        let marime = this.refs.marime.value;
        let stareImbracaminte = this.refs.stareImbracaminte.value;
        details = {marime, stareImbracaminte};
        if(!marime) {
          this.setState({errorMarime: 'Alege o marime.'});
          error = true;
        }
        if(!stareImbracaminte) {
          this.setState({errorStareImbracaminte: 'Alege starea.'});
          error = true;
        }
        break;
      }
    }

    images.map((image) => {
      if(!image.src.includes('blob')) {
        allImages.push(image);
      }
    });

    if(!error) {
      this.setState({error: ''});
      if(files.length > 0) {
        this.uploadImagesToCloudinary(files, (cloudinaryImages) => {

          allImages = allImages.concat(cloudinaryImages);

          Meteor.call('posts.update', this.state.post._id, allImages,
                       title, description, price, currency,
                       period, city, details, (err, res) => {
            if (!err) {
              this.setState({files: [], images: allImages, cloudinaryImages: []});
              document.getElementById('form').reset();
              this.setState({isOpen: false});
            }
            else {
              this.setState({error: err.reason});
            }
          });
        });
      }
      else {
        Meteor.call('posts.update', this.state.post._id, allImages,
                     title, description, price, currency,
                     period, city, details, (err, res) => {
          if (!err) {
            this.setState({files: [], images: allImages, cloudinaryImages: []});
            document.getElementById('form').reset();
            this.setState({isOpen: false});
          }
          else {
            this.setState({error: err.reason});
          }
        });
      }
    } else {
      this.setState({error: 'Verifica datele introduse !'});
    }
  }

  onImageDrop(files) {
    const allFiles = [];
    const allImages = [];

    files.map((file) => {
      allFiles.push(file);
      allImages.push({src: file.preview, thumbnail: file.preview,
          thumbnailWidth: (file.width * 150)/file.height,
          thumbnailHeight: 150, isSelected: false});
    });
    allFiles = allFiles.concat(this.state.files);
    allImages = allImages.concat(this.state.images);
    this.setState({files: allFiles});
    this.setState({images: allImages});
  }

  uploadImagesToCloudinary(files, callback) {
    const cloudinaryImages = [];
    const uploaders = files.map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tags", `codeinfuse, medium, gist`);
      formData.append("upload_preset", "jw3mtg3q");
      formData.append("api_key", "524359162211495");
      formData.append("timestamp", (Date.now()/1000) | 0);

      //Make an AJAX upload request using Axios
      return axios.post("https://api.cloudinary.com/v1_1/dvjh7zzuf/image/upload", formData,
        {headers: {"X-Requested-With": "XMLHttpRequest"},}).then(response => {
          const data = response.data;
          const fileURL = data.secure_url;
          const fileHeight = data.height;
          const fileWidth = data.width;
          cloudinaryImages.push({src: fileURL, thumbnail: fileURL, thumbnailWidth: (data.width * 170)/data.height,
          thumbnailHeight: 170, isSelected: false, public_id: data.public_id});
        });
    });
    axios.all(uploaders).then(() => {
      callback(cloudinaryImages);
    });
  }

  setSelectedToFalse() {
    let images = this.state.images;
    images.map((image) => {
      image.isSelected = false;
    });
    this.setState({images});
  }

  onSelectImage(index, image) {
    const images = this.state.images;
    const img = images[index];
    img.isSelected = !img.isSelected;

    this.setState({images});
    this.getSelectedImages();
  }

  getSelectedImages() {
    const selected = [];
    this.state.images.map((image) => {
      if(image.isSelected == true) {
        selected.push(this.state.images.indexOf(image));
      }
    });
    this.setState({selected});
  }

  handleModalClose() {
    this.setSelectedToFalse();
    this.setState({isOpen: false, files: [], selected: []});
    this.setState({errorTitle: '', errorCategory: '', errorDescription: '',
        errorPrice: '', errorCurrency: '', errorPeriod:'', errorCity: ''});
    this.setState({showAuto: 'none', showStare: 'none', showApartamente: 'none',
        showSuprafata: 'none', showImbracaminte: 'none'});
  }

  removeImages() {
    const newImages = [];
    const newFiles = [];
    const images = this.state.images;
    const files = this.state.files;
    const selected = this.state.selected;

    for(var i = 0; i < images.length; i++) {
      if (!selected.includes(i)) {
        newImages.push(images[i]);
      }
    }
    for(var i = 0; i < files.length; i++) {
      if (!selected.includes(i)) {
        newFiles.push(files[i]);
      }
    }
    this.setState({images: newImages});
    this.setState({files: newFiles});
    this.setState({selected: []});
  }

  getPostMessages() {
    const postMessages = [];
    Meteor.setTimeout(() => {
      this.state.publicMessages.map((message) => {
        if(!postMessages.includes(message.postId)) {
            postMessages.push(message.postId);
        }
      });
      this.setState({postMessages});
      const unreadMessages = [];
      postMessages.map((postMessage) => {
        const i = 0;
        this.state.publicMessages.map((message) => {
          if(message.postId === postMessage && !message.read) {
            i++;
          }
        });
        unreadMessages.push({postMessage, i});
      });
      this.setState({unreadMessages});
    }, 1000);
  }

  getUnreadMessages() {
    const count = 0;
    this.state.postMessages.map((postMessage) => {
      this.state.unreadMessages.map((message) => {
        if(postMessage === message.postMessage) {
          count += message.i;
        }
      })
    });
    if(count > 0) {
      return <span>({count})</span>;
    }
    return '';
  }

  render() {
    return (
      <div className="account__function">
        <div className="account__title" onClick={() => {this.state.displayPosts === 'none' ? this.setState({displayPosts: 'block'}) :
                        this.setState({displayPosts: 'none'})}}>
          <h3>Anunturile mele {this.state.unreadMessages !== null && this.state.postMessages !== null ?
                              this.getUnreadMessages()
                            : undefined }</h3>
          <img src={this.state.displayPosts === 'none' ? '/arrow-down.png' : '/arrow-up.png'}/>
        </div>
        <div className="account__content" style={{display: this.state.displayPosts}}>

          {this.state.posts.length > 0 ?
            this.state.posts.map((post) => {
              return(
                <div key={post._id}>
                  {this.state.unreadMessages !== null ?
                    this.state.unreadMessages.map((unreadMessage) => {
                      if(post._id === unreadMessage.postMessage) {
                        if(unreadMessage.i === 1) {
                          return (
                            <div key={post._id}>
                              <p><i>Ai un mesaj nou. <Link to={"/posts/"+post._id}
                              onClick={() => {Meteor.call('messages.markPostMessagesRead', post._id)}}>(Deschide)</Link></i></p>
                            </div>
                          )
                        }
                        if(unreadMessage.i > 1) {
                          return (
                            <div key={post._id}>
                              <p><i>Ai {unreadMessage.i} mesaje noi. <Link to={"/posts/"+post._id}
                              onClick={() => {Meteor.call('messages.markPostMessagesRead', post._id)}}>(Deschide)</Link></i></p>
                            </div>
                          )
                        }
                      }
                    })
                  : undefined }

                  <div className="account__post">
                    <div>
                      <h2>{post.title}</h2>
                      <h3>{post.price} {post.currency}/{post.period}, {post.city}</h3>
                    </div>
                    <div>
                      <div className="tooltip">
                        <img src="edit-blue.png" className="account__image"
                          onClick={() => {
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
                            this.setState({isOpen: true, post: post, images: post.images});
                          }}/>
                        <span className="tooltiptext">Modifica</span>
                      </div>

                      <div className="tooltip">
                        <img src="delete.png" className="account__image"
                          onClick={() => {this.setState({deleteIsOpen: true, post: post})}}/>
                        <span className="tooltiptext">Elimina</span>
                      </div>

                      <Modal
                        isOpen={this.state.deleteIsOpen}
                        contentLabel="Elimina"
                        onRequestClose={() => {this.setState({deleteIsOpen: false})}}
                        className="boxed-view__box"
                        overlayClassName="boxed-view boxed-view--modal">
                        <div>
                          <h3>Sigur vrei sa elimini acest anunt?</h3>
                          <div className="account__title">
                            <button className="button-cancel" onClick={() => {
                                                                Meteor.call('users.removeReferences', this.state.post._id, (err, res) => {
                                                                  Meteor.call('posts.delete', this.state.post._id);
                                                                });
                                                                this.setState({deleteIsOpen:false})}}>Elimina</button>
                            <button className="button-submit" onClick={() => {this.setState({deleteIsOpen: false})}}>Inchide</button>
                          </div>
                        </div>
                      </Modal>
                    </div>

                    <Modal
                      isOpen={this.state.isOpen}
                      contentLabel="Post"
                      onAfterOpen={() => {this.refs.title.focus()}}
                      onRequestClose={this.handleModalClose}
                      className="boxed-view__boxP"
                      overlayClassName="boxed-view boxed-view--modalP">

                      <div>

                        <form id="form" noValidate="true" onSubmit={this.onSubmit.bind(this)} className="boxed-view__form">

                          <p><i>Categorie: {this.state.post.category}</i></p>
                          <p><i>Codul anuntului: {this.state.post._id}</i></p>
                          <label>Titlu:
                            <input className={this.state.errorTitle ? 'text-input error' : 'text-input'}
                                   type="text" ref="title" name="title" defaultValue={this.state.post.title}
                                   onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                                       this.setState({errorTitle: ''});
                                                     }}}/>
                            {this.state.errorTitle ? <p>{this.state.errorTitle}</p> : undefined }
                          </label>
                          {this.state.showAuto === 'block' ?
                            <div>
                              <div>
                                <label>Marca:
                                  <input className={this.state.errorMarca ? 'text-input error' : 'text-input'}
                                         type="text" ref="marca" name="marca" defaultValue={this.state.post.details.marca}
                                         onChange={(e) => {if(e.target.value.trim().length >= 2) {
                                                             this.setState({errorMarca: ''});
                                                           }}}/>
                                  {this.state.errorMarca ? <p>{this.state.errorMarca}</p> : undefined}
                                </label>
                              </div>
                              <div>
                                <label>Model:
                                  <input className={this.state.errorModel ? 'text-input error' : 'text-input'}
                                         type="text" ref="model" name="model" defaultValue={this.state.post.details.model}
                                         onChange={(e) => {if(e.target.value.trim().length >= 2) {
                                                             this.setState({errorModel: ''});
                                                           }}}/>
                                  {this.state.errorModel ? <p>{this.state.errorModel}</p> : undefined}
                                </label>
                              </div>
                              <div>
                                <label>Combustibil:
                                  <input className={this.state.errorCombustibil ? 'text-input error' : 'text-input'}
                                         type="text" ref="combustibil" name="combustibil" defaultValue={this.state.post.details.combustibil}
                                         onChange={(e) => {if(e.target.value.trim().length >= 2) {
                                                             this.setState({errorCombustibil: ''});
                                                           }}}/>
                                  {this.state.errorCombustibil ? <p>{this.state.errorCombustibil}</p> : undefined}
                                </label>
                              </div>
                              <div>
                                <label>Anul fabricatiei:
                                  <input className={this.state.errorAnFabricatie ? 'text-input error' : 'text-input'}
                                         type="month" ref="anFabricatie" name="anFabricatie" defaultValue={this.state.post.details.anFabricatie}
                                         onChange={(e) => {if(e.target.value) {
                                                             this.setState({errorAnFabricatie: ''});
                                                           }}}/>
                                  {this.state.errorAnFabricatie ? <p>{this.state.errorAnFabricatie}</p> : undefined}
                                </label>
                              </div>
                              <div>
                                <label>Rulaj (km):
                                  <input className={this.state.errorRulaj ? 'text-input error' : 'text-input'}
                                         type="number" ref="rulaj" name="rulaj" defaultValue={this.state.post.details.rulaj}
                                         onChange={(e) => {if(e.target.value > 0) {
                                                             this.setState({errorRulaj: ''});
                                                           }}}/>
                                  {this.state.errorRulaj ? <p>{this.state.errorRulaj}</p> : undefined}
                                </label>
                              </div>
                              <div>
                                <label>Capacitate cilindrica (cm<sup>3</sup>):
                                  <input className={this.state.errorCapacitate ? 'text-input error' : 'text-input'}
                                         type="number" ref="capacitate" name="capacitate" defaultValue={this.state.post.details.capacitate}
                                         onChange={(e) => {if(e.target.value > 0) {
                                                             this.setState({errorCapacitate: ''});
                                                           }}}/>
                                  {this.state.errorCapacitate ? <p>{this.state.errorCapacitate}</p> : undefined}
                                </label>
                              </div>
                            </div>
                          : undefined }
                          {this.state.showStare === 'block' ?
                            <div>
                              <div>
                                <select className={this.state.errorStare ? 'text-input error' : 'text-input'}
                                       ref="stare" name="stare" defaultValue={this.state.post.details.stare}
                                       onClick={(e) => {if(e.target.value) {
                                                           this.setState({errorStare: ''});
                                                         }}}>
                                  <option value="">Alege starea</option>
                                  <option value="Nou">Nou</option>
                                  <option value="Utilizat">Utilizat</option>
                                </select>
                              </div>
                            </div>
                          : undefined }
                          {this.state.showApartamente === 'block' ?
                            <div>
                              <div>
                                <select className={this.state.errorCamere ? 'text-input error' : 'text-input'}
                                       ref="camere" name="camere" defaultValue={this.state.post.details.camere}
                                       onClick={(e) => {if(e.target.value) {
                                                           this.setState({errorCamere: ''});
                                                         }}}>
                                  <option value="">Alege numarul camerelor</option>
                                  <option value="o camera">o camera</option>
                                  <option value="doua camere">doua camere</option>
                                  <option value="trei camere">trei camere</option>
                                  <option value="patru sau mai multe camere">patru sau mai multe camere</option>
                                </select>
                              </div>
                              <div>
                                <label>Suprafata (m<sup>2</sup>):
                                  <input className={this.state.errorSuprafataApartament ? 'text-input error' : 'text-input'}
                                         type="number" ref="suprafataApartament" name="suprafataApartament" defaultValue={this.state.post.details.suprafataApartament}
                                         onChange={(e) => {if(e.target.value > 9) {
                                                             this.setState({errorSuprafataApartament: ''});
                                                           }}}/>
                                  {this.state.errorSuprafataApartament ? <p>{this.state.errorSuprafataApartament}</p> : undefined}
                                </label>
                              </div>
                            </div>
                          : undefined }
                          {this.state.showSuprafata === 'block' ?
                            <div>
                              <div>
                                <label>Suprafata (m<sup>2</sup>):
                                  <input className={this.state.errorSuprafata ? 'text-input error' : 'text-input'}
                                         type="number" ref="suprafata" name="suprafata" defaultValue={this.state.post.details.suprafata}
                                         onChange={(e) => {if(e.target.value > 0) {
                                                             this.setState({errorSuprafata: ''});
                                                           }}}/>
                                  {this.state.errorSuprafata ? <p>{this.state.errorSuprafata}</p> : undefined}
                                </label>
                              </div>
                            </div>
                          : undefined }
                          {this.state.showImbracaminte === 'block' ?
                            <div>
                              <div>
                                <select className={this.state.errorMarime ? 'text-input error' : 'text-input'}
                                       ref="marime" name="marime" defaultValue={this.state.post.details.marime}
                                       onClick={(e) => {if(e.target.value) {
                                                           this.setState({errorMarime: ''});
                                                         }}}>
                                  <option value="">Alege marimea</option>
                                  <option value="32/XXS">32/XXS</option>
                                  <option value="34/XS">34/XS</option>
                                  <option value="36/S">36/S</option>
                                  <option value="38-40/M">38-40/M</option>
                                  <option value="42-44/L">42-44/L</option>
                                  <option value="46-48/XL">46-48/XL</option>
                                  <option value="50-54/XXL">50-54/XXL</option>
                                  <option value="56-58/XXXL">56-58/XXXL</option>
                                </select>
                              </div>
                              <div>
                                <select className={this.state.errorStareImbracaminte ? 'text-input error' : 'text-input'}
                                       ref="stareImbracaminte" name="stareImbracaminte" defaultValue={this.state.post.details.stareImbracaminte}
                                       onClick={(e) => {if(e.target.value) {
                                                           this.setState({errorStareImbracaminte: ''});
                                                         }}}>
                                  <option value="">Alege starea</option>
                                  <option value="Nou">Nou</option>
                                  <option value="Utilizat">Utilizat</option>
                                </select>
                              </div>
                            </div>
                          : undefined }

                          <label>Descriere:
                            <textarea className={this.state.errorDescription ? 'text-input error' : 'text-input'}
                                      ref="description" name="description" style={{resize: 'none'}} defaultValue={this.state.post.description}
                                      onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                                          this.setState({errorDescription: ''});
                                                        }}}/>
                            {this.state.errorDescription ? <p>{this.state.errorDescription}</p> : undefined }
                          </label>

                          <div className="form__currency">
                            <input className={this.state.errorPrice ? 'text-input error' : 'text-input'}
                                   type="number" ref="price" name="price" defaultValue={this.state.post.price}
                                   onChange={(e) => {if(e.target.value >= 1) {
                                                       this.setState({errorPrice: ''});
                                                     }}}/>

                            <select className={this.state.errorCurrency ? 'text-input error' : 'text-input'}
                                    ref="currency" name="currency" defaultValue={this.state.post.currency}
                                    onClick={(e) => {if(e.target.value) {
                                                        this.setState({errorCurrency: ''});
                                                      }}}>
                               <option value="">Alege moneda</option>
                               <option value="RON">RON</option>
                               <option value="EUR">EUR</option>
                               <option value="USD">USD</option>
                             </select>

                              <select className={this.state.errorPeriod ? 'text-input error' : 'text-input'}
                                     ref="period" name="period" defaultValue={this.state.post.period}
                                     onClick={(e) => {if(e.target.value) {
                                                         this.setState({errorPeriod: ''});
                                                       }}}>
                                <option value="">Alege perioada</option>
                                <option value="ora">ora</option>
                                <option value="zi">zi</option>
                                <option value="saptamana">saptamana</option>
                                <option value="luna">luna</option>
                                <option value="an">an</option>
                              </select>
                          </div>

                          <label>
                            <input className={this.state.errorCity ? 'text-input error' : 'text-input'}
                                   type="text" ref="city" name="city" defaultValue={this.state.post.city}
                                   onChange={(e) => {if(e.target.value.trim().length >= 3) {
                                                       this.setState({errorCity: ''});
                                                     }}}/>
                            {this.state.errorCity ? <p>{this.state.errorCity}</p> : undefined}
                          </label>

                          {post.images.length > 0 ?
                            <div className="">
                              <div className="form__center">
                                <button type="button" className="button-cancel" onClick={this.removeImages}>Elimina fotografiile selectate ({this.state.selected.length})</button>
                              </div>
                              <div>
                                <Gallery images={this.state.images} backdropClosesModal={true} onSelectImage={this.onSelectImage}/>
                              </div>
                            </div>
                          : undefined}

                          <Dropzone multiple onDrop={this.onImageDrop} accept="image/*" className="form__dropzone">
                            <h2>Trage imaginile aici sau apasa pentru a le selecta.</h2>
                          </Dropzone>

                          <div className="form__center">
                            {this.state.error ? <p>{this.state.error}</p> : undefined}
                          </div>

                          <div className="form__center">
                            <button className="button-submit">Modifica anuntul</button>
                          </div>

                        </form>

                        <button type="button" className="button header__cancel" onClick={this.handleModalClose}>Inchide</button>
                      </div>

                    </Modal>
                  </div>

                </div>
              );
            })
          : <h2>Nu ai adaugat niciun anunt.</h2>}

        </div>

      </div>
    );
  }
}

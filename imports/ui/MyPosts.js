import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import Modal from 'react-modal';
import React from 'react';
import Dropzone from 'react-dropzone';
import Gallery from 'react-grid-gallery';
import axios from 'axios';

import {Posts} from '../api/posts';

export default class MyPosts extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      error: '',
      displayPosts: 'none',
      posts: [],
      post: {},
      isOpen: false,
      deleteIsOpen: false,
      images: [],
      files: [],
      selected: [],
      cloudinaryImages: []
    }
    this.handleModalClose = this.handleModalClose.bind(this);
    this.uploadImagesToCloudinary = this.uploadImagesToCloudinary.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onImageDrop = this.onImageDrop.bind(this);
    this.removeImages = this.removeImages.bind(this);
    this.onSelectImage = this.onSelectImage.bind(this);
    this.getSelectedImages = this.getSelectedImages.bind(this);
    this.setSelectedToFalse = this.setSelectedToFalse.bind(this);
    this.deletePost = this.deletePost.bind(this);
  }

  componentDidMount() {
    this.postsTracker = Tracker.autorun(() => {
      Meteor.subscribe('userPosts');
      const posts = Posts.find({}).fetch();
      this.setState({posts});
    });
  }

  componentWillUnmount() {
    this.postsTracker.stop();
  }

  deletePost() {

  }

  onSubmit(e) {
    e.preventDefault();
    this.setSelectedToFalse();

    let title = this.refs.title.value.trim();
    let category = this.refs.category.value;
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
    if(!category) {
      this.setState({errorCategory: 'Alege o categorie.'});
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

          Meteor.call('posts.update', this.state.post._id, allImages, (err, res) => {
            if (!err) {
              console.log('Anuntul s-a modificat cu succes');

              this.setState({files: []});
              this.setState({images: allImages});
              this.setState({cloudinaryImages: []});
              document.getElementById('form').reset();
            }
            else {
              this.setState({error: err.reason});
              console.log('error reason', err.reason);
            }
          });
          console.log('allImages',allImages);
        });
      }
      else {
        Meteor.call('posts.update', this.state.post._id, allImages,
                     title, category, description, price, currency,
                     period, city, (err, res) => {
          if (!err) {
            console.log('Anuntul s-a modificat cu succes');

            this.setState({files: []});
            this.setState({images: allImages});
            this.setState({cloudinaryImages: []});
            document.getElementById('form').reset();
          }
          else {
            this.setState({error: err.reason});
            console.log('error reason', err.reason);
          }
        });
      }
    } else {
      this.setState({error: 'Verifica datele introduse !'});
    }
  }

  handleModalClose() {
    this.setSelectedToFalse();
    this.setState({isOpen: false, files: [], selected: []});
    this.setState({errorTitle: '', errorCategory: '', errorDescription: '',
         errorPrice: '', errorCurrency: '', errorPeriod:'', errorCity: ''});
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
    this.setState({images: newImages},() =>{console.log('images after remove',this.state.images)} );
    this.setState({files: newFiles}, () =>{console.log('files after remove',this.state.files)});
    this.setState({selected: []});
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

    this.setState({images}, () => {console.log(this.state.images)});
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
    this.setState({files: allFiles},() =>{console.log('files after load',this.state.files)});
    this.setState({images: allImages},() => {console.log('images after load',this.state.images)});
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

  render() {
    return (
      <div className="account__function">
        <div className="account__title">
          <h3>Anunturile mele</h3>
          <img src={this.state.displayPosts === 'none' ? '/arrow-down.png' : '/arrow-up.png'}
            onClick={() => {this.state.displayPosts === 'none' ? this.setState({displayPosts: 'block'}) :
                            this.setState({displayPosts: 'none'})}}/>
        </div>
        <div className="account__content" style={{display: this.state.displayPosts}}>

          {this.state.posts.length > 0 ?
            this.state.posts.map((post) => {
              return(
                <div key={post._id} className="account__post">
                  <div>
                    <h2>{post.title}</h2>
                    <h3>{post.price} {post.currency}/{post.period}, {post.city}</h3>
                  </div>
                  <div>
                    <div className="tooltip">
                      <img src="edit-blue.png" className="account__image"
                        onClick={() => {this.setState({isOpen: true, post: post, images: post.images})}}/>
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
                      // onAfterOpen={() => {this.refs.title.focus()}}
                      onRequestClose={() => {this.setState({deleteIsOpen: false})}}
                      className="boxed-view__box"
                      overlayClassName="boxed-view boxed-view--modal">
                      <div>
                        <h3>Sigur vrei sa elimini acest anunt?</h3>
                        <div className="account__title">
                          <button className="button" onClick={() => {Meteor.call('posts.delete', this.state.post._id);
                                                              this.setState({deleteIsOpen:false})}}>Elimina</button>
                          <button className="button" onClick={() => {this.setState({deleteIsOpen: false})}}>Inchide</button>
                        </div>
                      </div>
                    </Modal>
                  </div>

                  <Modal
                    isOpen={this.state.isOpen}
                    contentLabel="Post"
                    // onAfterOpen={() => {this.refs.title.focus()}}
                    onRequestClose={this.handleModalClose}
                    className="boxed-view__boxP"
                    overlayClassName="boxed-view boxed-view--modalP">

                    <div>

                      <form id="form" noValidate="true" onSubmit={this.onSubmit.bind(this)} className="boxed-view__form">

                        <label>{this.state.errorTitle ? <p>{this.state.errorTitle}</p> : "Titlu:"}
                          <input type="text" placeholder="Titlu" defaultValue={this.state.post.title}
                                 ref="title" className={this.state.errorTitle ? 'text-input error' : 'text-input'}
                                 onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                                     this.setState({errorTitle: ''});
                                                   }}}/>
                        </label>

                        <select className={this.state.errorCategory ? 'text-input error' : 'text-input'}
                                ref="category" name="category" defaultValue={this.state.post.category}
                                onClick={(e) => {if(e.target.value) {
                                                    this.setState({errorCategory: ''});
                                                  }}}>
                          <option value="">Alege o categorie</option>
                          <option value="auto">Auto</option>
                          <option value="cursuri">Cursuri</option>
                          <option value="echipamente">Echipamente</option>
                          <option value="imobiliare">Imobiliare</option>
                          <option value="imbracaminte">Imbracaminte</option>
                          <option value="servicii">Servicii</option>
                        </select>

                        <label>{this.state.errorDescription ? <p>{this.state.errorDescription}</p> : "Descriere:"}
                          <textarea className={this.state.errorDescription ? 'text-input error' : 'text-input'}
                                    ref="description" name="description" placeholder="Descriere" style={{resize: 'none'}}
                                    defaultValue={this.state.post.description}
                                    onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                                        this.setState({errorDescription: ''});
                                                      }}}/>
                        </label>

                        <div className="form__currency">
                          <input className={this.state.errorPrice ? 'text-input error' : 'text-input'}
                                 type="number" ref="price" name="price" placeholder="Pret"
                                 defaultValue={this.state.post.price}
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
                              <option value="minut">Minut</option>
                              <option value="ora">Ora</option>
                              <option value="zi">Zi</option>
                              <option value="saptamana">Saptamana</option>
                              <option value="luna">Luna</option>
                              <option value="an">An</option>
                            </select>
                        </div>

                        <label>{this.state.errorCity ? <p>{this.state.errorCity}</p> : "Localitate:"}
                          <input type="text" placeholder="Localitate" defaultValue={this.state.post.city}
                                 ref="city" name="city" className={this.state.errorCity ? 'text-input error' : 'text-input'}/>
                        </label>

                        <Dropzone multiple onDrop={this.onImageDrop} accept="image/*" className="form__dropzone">
                          <h2>Trage imaginile aici sau apasa pentru a le selecta.</h2>
                        </Dropzone>

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
              );
            })
          : undefined}

        </div>

      </div>
    );
  }
}

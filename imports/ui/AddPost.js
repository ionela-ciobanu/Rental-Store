import {Meteor} from 'meteor/meteor';
import React from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import Gallery from 'react-grid-gallery';
import { RiseLoader } from 'react-spinners';
import Modal from 'react-modal';

import PrivateHeader from './PrivateHeader';

export default class AddPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      images: [],
      selected: [],
      cloudinaryImages: [],
      loading: false
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onImageDrop = this.onImageDrop.bind(this);
    this.uploadImagesToCloudinary = this.uploadImagesToCloudinary.bind(this);
    this.onSelectImage = this.onSelectImage.bind(this);
    this.getSelectedImages = this.getSelectedImages.bind(this);
    this.removeImages = this.removeImages.bind(this);
  }

  onSubmit(e, callback) {
    e.preventDefault();

    this.setState({loading: true});

    let title = this.refs.title.value.trim();
    let category = this.refs.category.value;
    let description = this.refs.description.value.trim();
    let price = this.refs.price.value.trim();
    let currency = this.refs.currency.value;
    let period = this.refs.period.value;
    let city = this.refs.city.value.trim();
    let images = this.state.images;
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

    if(!error) {
      this.uploadImagesToCloudinary(this.state.files, (cloudinaryImages) => {
        Meteor.call('posts.insert', title, category, description, price, currency, period, city, cloudinaryImages, (err, res) => {
          if (!err) {
            console.log('Anuntul a fost adaugat cu succes');
            callback();
            this.setState({files: []});
            this.setState({images: []});
            this.setState({cloudinaryImages: []});
            document.getElementById('form').reset();
          }
          else {
            this.setState({error: err.reason});
            callback();
            console.log('error reason', err.reason);
          }
        });
      });
    } else {
      callback();
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

    this.setState({files: this.state.files.concat(allFiles)});
    this.setState({images: this.state.images.concat(allImages)});
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

  removeImages() {
    const newImages = [];
    const images = this.state.images;
    const selected = this.state.selected;

    for(var i = 0; i < images.length; i++) {
      if (!selected.includes(i)) {
        newImages.push(images[i]);
      }
    }
    this.setState({images: newImages});
    this.setState({selected: []});
  }

  handleModalClose() {
    console.log('inchis');
    this.setState({loading: false});
  }

  render() {
    return (
      <div>
        <PrivateHeader title="Rental Store"/>
        <div className="page-content">
          <form id="form" className="form" onSubmit={(e) => {
                                                      this.onSubmit(e, () => {
                                                        this.setState({loading: false});
                                                      });
                                                    }}>

            <div className="form__element">
              <label>Titlu:
                <input className={this.state.errorTitle ? 'text-input error' : 'text-input'}
                       type="text" ref="title" name="title" placeholder="Alege un titlu potrivit pentru anuntul tau."
                       onChange={(e) => {if(e.target.value.trim().length < 4) {
                                           this.setState({errorTitle: 'Titlul trebuie sa contina cel putin 4 caractere.'});
                                         } else {
                                           this.setState({errorTitle: ''});
                                         }}}/>
                {this.state.errorTitle ? <p>{this.state.errorTitle}</p> : undefined}
              </label>
            </div>

            <div className="form__element">
              <select className={this.state.errorCategory ? 'text-input error' : 'text-input'}
                      ref="category" name="category"
                      onClick={(e) => {if(!e.target.value) {
                                          this.setState({errorCategory: 'Alege o categorie.'});
                                        } else {
                                          this.setState({errorCategory: ''});
                                        }}}>
                <option value="">Alege o categorie</option>
                <option value="imobiliare">Imobiliare</option>
                <option value="auto">Auto</option>
                <option value="cursuri">Cursuri</option>
                <option value="servicii">Servicii</option>
                <option value="obiecte">Obiecte</option>
              </select>
            </div>

            <div className="form__element">
              <label>Descriere:
                <textarea className={this.state.errorDescription ? 'text-input error' : 'text-input'}
                          ref="description" name="description" placeholder="Descriere" style={{resize: 'none'}}
                          onChange={(e) => {if(e.target.value.trim().length < 4) {
                                              this.setState({errorDescription: 'Descrierea trebuie sa contina cel putin 4 caractere.'});
                                            } else {
                                              this.setState({errorDescription: ''});
                                            }}}/>
                {this.state.errorDescription ? <p>{this.state.errorDescription}</p> : undefined}
              </label>
            </div>

            <div className="form__element form__currency">
              <input className={this.state.errorPrice ? 'text-input error' : 'text-input'}
                     type="number" ref="price" name="price" placeholder="Pret"
                     onChange={(e) => {if(e.target.value < 1) {
                                         this.setState({errorPrice: 'Pretul nu este valid.'});
                                       } else {
                                         this.setState({errorPrice: ''});
                                       }}}/>

              <select className={this.state.errorCurrency ? 'text-input error' : 'text-input'}
                      ref="currency" name="currency"
                      onClick={(e) => {if(!e.target.value) {
                                          this.setState({errorCurrency: 'Alege moneda.'});
                                        } else {
                                          this.setState({errorCurrency: ''});
                                        }}}>
                 <option value="">Alege moneda</option>
                 <option value="RON">RON</option>
                 <option value="EUR">EUR</option>
                 <option value="USD">USD</option>
               </select>

                <select className={this.state.errorPeriod ? 'text-input error' : 'text-input'}
                       ref="period" name="period"
                       onClick={(e) => {if(!e.target.value) {
                                           this.setState({errorPeriod: 'Alege perioada.'});
                                         } else {
                                           this.setState({errorPeriod: ''});
                                         }}}>
                  <option value="">Alege perioada</option>
                  <option value="minut">Minut</option>
                  <option value="ora">Ora</option>
                  <option value="zi">Zi</option>
                  <option value="saptamana">Saptamana</option>
                  <option value="Luna">Luna</option>
                  <option value="An">An</option>
                </select>
            </div>

            <div className="form__element">
              <label>Localitate:
                <input className={this.state.errorCity ? 'text-input error' : 'text-input'}
                       type="text" ref="city" name="city" placeholder="Scrie localitatea ta."
                       onChange={(e) => {if(e.target.value.trim().length < 3) {
                                           this.setState({errorCity: 'Localitatea trebuie sa contina cel putin 3 caractere.'});
                                         } else {
                                           this.setState({errorCity: ''});
                                         }}}/>
                {this.state.errorCity ? <p>{this.state.errorCity}</p> : undefined}
              </label>
            </div>

            <div className="form__element">
              <Dropzone multiple onDrop={this.onImageDrop} accept="image/*" className="form__dropzone">
                <h2>Trage imaginile aici sau apasa pentru a le selecta.</h2>
              </Dropzone>
            </div>

            {this.state.images.length > 0 ?
              <div className="form__element">
                <div className="form__center">
                  <button type="button" className="button-cancel" onClick={this.removeImages}>Elimina fotografiile selectate ({this.state.selected.length})</button>
                </div>
                <div>
                  <Gallery images={this.state.images} backdropClosesModal={true} onSelectImage={this.onSelectImage}/>
                </div>
              </div>
            : undefined}

            <div className="form__center">
              <button className="button-add">Adauga anuntul</button>
            </div>

          </form>

          <Modal
            isOpen={this.state.loading}
            contentLabel="loading"
            className="boxed-view__box"
            overlayClassName="boxed-view boxed-view--modal">
            <RiseLoader
              color={'#008066'}
              loading={this.state.loading}
            />
          </Modal>
        </div>
      </div>
    );
  }
}

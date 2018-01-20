import {Meteor} from 'meteor/meteor';
import React from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import Gallery from 'react-grid-gallery';
import { RiseLoader } from 'react-spinners';
import Modal from 'react-modal';
import {Tracker} from 'meteor/tracker';
import {Link} from 'react-router-dom';

import PrivateHeader from './PrivateHeader';

export default class AddPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      files: [],
      images: [],
      selected: [],
      cloudinaryImages: [],
      loading: false,
      showAuto: 'none',
      showStare: 'none',
      showApartamente: 'none',
      showSuprafata: 'none',
      showImbracaminte: 'none',
      userData: {},
      usernames: []
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onImageDrop = this.onImageDrop.bind(this);
    this.uploadImagesToCloudinary = this.uploadImagesToCloudinary.bind(this);
    this.onSelectImage = this.onSelectImage.bind(this);
    this.getSelectedImages = this.getSelectedImages.bind(this);
    this.removeImages = this.removeImages.bind(this);
    this.setSelectedToFalse = this.setSelectedToFalse.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.checkSearchCriteria = this.checkSearchCriteria.bind(this);
    this.startTracking = this.startTracking.bind(this);
  }

  componentDidMount() {
    Meteor.setTimeout(this.startTracking, 0);
  }

  startTracking() {
    var handle = Meteor.subscribe('userData');
    this.userTracker = Tracker.autorun(() => {
      if(handle.ready()) {
        const userData = Meteor.users.findOne({});
        this.setState({userData});
      }
    });

    var handleUsernames = Meteor.subscribe('usernames');
    this.usernamesTracker = Tracker.autorun(() => {
      if(handleUsernames.ready()) {
        const usernames = Meteor.users.find({_id: {$ne: Meteor.userId()}}).fetch();
        this.setState({usernames});
      }
    });
  }

  componentWillUnmount() {
    this.userTracker.stop();
    this.usernamesTracker.stop();
  }

  checkSearchCriteria(city, category, title, price, currency, res) {
    this.state.usernames.map((user) => {
      if(user.personalInfo.searchCriteria.length > 0) {
        user.personalInfo.searchCriteria.map((search) => {
          if(search.city === city && search.category === category && search.currency === currency
          && search.maxPrice <= price && title.toLowerCase().includes(search.keyword.toLowerCase())) {
            Meteor.call('sendEmail', user.emails[0].address, 'support@rentalstore.com', 'Rental Store - Anunt nou',
              `${Meteor.user().username} a adaugat un anunt care te poate interesa. Il poti vedea aici: ${"rental-store-ionela.herokuapp.com/posts/" + res} .`);
          }
        })
      }
    });
  }

  onSubmit(e, callback) {
    e.preventDefault();
    this.setSelectedToFalse();
    this.setState({loading: true});

    let title = this.refs.title.value.trim();
    let category = this.refs.category.value;
    var details = {};
    let description = this.refs.description.value.trim();
    let price = this.refs.price.value;
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
    } else {
      switch (category) {
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
      this.setState({error: ''});
      this.uploadImagesToCloudinary(this.state.files, (cloudinaryImages) => {
        Meteor.call('posts.insert', title, category, description, price, currency, period, city, cloudinaryImages, details, (err, res) => {
          if (!err) {
            callback();
            this.setState({files: []});
            this.setState({images: []});
            this.setState({cloudinaryImages: []});
            document.getElementById('form').reset();
            this.checkSearchCriteria(city, category, title, price, currency, res);
            alert('Anuntul a fost adaugat !');
          }
          else {
            this.setState({error: err.reason});
            callback();
          }
        });
      });
    } else {
      this.setState({error: 'Verifica datele introduse !'});
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

  removeImages() {
    const newImages = [];
    const newFiles = [];
    const images = this.state.images;
    const files = this.state.files;
    const selected = this.state.selected;

    for(var i = 0; i < images.length; i++) {
      if (!selected.includes(i)) {
        newImages.push(images[i]);
        newFiles.push(files[i]);
      }
    }
    this.setState({images: newImages});
    this.setState({files: newFiles});
    this.setState({selected: []});
  }

  onCategoryChange(e) {
    if(e.target.value) {
      this.setState({errorCategory: ''});
      switch (e.target.value) {
        case 'Autoturisme':
        case 'Autoutilitare':
        case 'Camioane':
        case 'Remorci': this.setState({showAuto: 'block', showStare: 'none', showApartamente: 'none', showSuprafata: 'none', showImbracaminte: 'none'});
                        break;
        case 'Echipamente audio':
        case 'Echipamente video':
        case 'Echipamente foto':
        case 'Echipamente sportive':
        case 'Alte echipamente':
        case 'Mobila':
        case 'Unelte':
        case 'Accesorii': this.setState({showStare: 'block', showAuto: 'none', showApartamente: 'none', showSuprafata: 'none', showImbracaminte: 'none'});
                          break;
        case 'Apartamente':
        case 'Vile': this.setState({showApartamente: 'block', showAuto: 'none', showStare: 'none', showSuprafata: 'none', showImbracaminte: 'none'});
                     break;
        case 'Terenuri':
        case 'Garaje':
        case 'Spatii comerciale':
        case 'Alte proprietati': this.setState({showSuprafata: 'block', showAuto: 'none', showStare: 'none', showApartamente: 'none', showImbracaminte: 'none'});
                                break;
        case 'Imbracaminte universala':
        case 'Imbracaminte dama':
        case 'Imbracaminte barbati':
        case 'Imbracaminte copii': this.setState({showImbracaminte: 'block', showAuto: 'none', showStare: 'none', showApartamente: 'none', showSuprafata: 'none'})
      }
    } else {
      this.setState({errorCategory: 'Alege o categorie.'});
      this.setState({showAuto: 'none', showStare: 'none', showApartamente: 'none', showSuprafata: 'none', showImbracaminte: 'none'});
    }

  }

  render() {
    return (
      <div>
        <PrivateHeader title="Rental Store"/>
        <div className="page__content">
          {this.state.userData !== undefined && this.state.userData.personalInfo !== undefined ?
            this.state.userData.personalInfo.firstName && this.state.userData.personalInfo.lastName &&
            this.state.userData.personalInfo.address && this.state.userData.personalInfo.phone ?

            <form id="form" className="form" onSubmit={(e) => {
                                                        this.onSubmit(e, () => {
                                                          this.setState({loading: false});
                                                        });
                                                      }}>

              <div className="form__element">
                <label>Titlu:
                  <input className={this.state.errorTitle ? 'text-input error' : 'text-input'}
                         type="text" ref="title" name="title" placeholder="Alege un titlu potrivit pentru anuntul tau."
                         onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                             this.setState({errorTitle: ''});
                                           }}}/>
                  {this.state.errorTitle ? <p>{this.state.errorTitle}</p> : undefined}
                </label>
              </div>

              <div className="form__element">
                <select id="select" className={this.state.errorCategory ? 'text-input error' : 'text-input'}
                        ref="category" name="category" onChange={this.onCategoryChange}>

                  <option value="">Alege o categorie</option>
                  <optgroup label="Auto">
                    <option value="Autoturisme">Autoturisme</option>
                    <option value="Autoutilitare">Autoutilitare</option>
                    <option value="Camioane">Camioane</option>
                    <option value="Remorci">Remorci</option>
                  </optgroup>
                  <optgroup label="Echipamente">
                    <option value="Echipamente audio">Audio</option>
                    <option value="Echipamente video">Video</option>
                    <option value="Echipamente foto">Foto</option>
                    <option value="Echipamente sportive">Sportive</option>
                    <option value="Alte echipamente">Alte echipamente</option>
                  </optgroup>
                  <optgroup label="Imobiliare">
                    <option value="Apartamente">Apartamente</option>
                    <option value="Vile">Vile</option>
                    <option value="Terenuri">Terenuri</option>
                    <option value="Garaje">Garaje</option>
                    <option value="Spatii comerciale">Spatii comerciale</option>
                    <option value="Alte proprietati">Alte proprietati</option>
                  </optgroup>
                  <optgroup label="Imbracaminte">
                    <option value="Imbracaminte universala">Universala</option>
                    <option value="Imbracaminte dama">Dama</option>
                    <option value="Imbracaminte barbati">Barbati</option>
                    <option value="Imbracaminte copii">Copii</option>
                  </optgroup>
                  <optgroup label="Alte produse">
                    <option value="Mobila">Mobila</option>
                    <option value="Unelte">Unelte</option>
                    <option value="Accesorii">Accesorii</option>
                  </optgroup>
                </select>

                <div style={{display: this.state.showAuto}}>
                  <div className="form__element">
                    <label>Marca:
                      <input className={this.state.errorMarca ? 'text-input error' : 'text-input'}
                             type="text" ref="marca" name="marca"
                             onChange={(e) => {if(e.target.value.trim().length >= 2) {
                                                 this.setState({errorMarca: ''});
                                               }}}/>
                      {this.state.errorMarca ? <p>{this.state.errorMarca}</p> : undefined}
                    </label>
                  </div>
                  <div className="form__element">
                    <label>Model:
                      <input className={this.state.errorModel ? 'text-input error' : 'text-input'}
                             type="text" ref="model" name="model"
                             onChange={(e) => {if(e.target.value.trim().length >= 2) {
                                                 this.setState({errorModel: ''});
                                               }}}/>
                      {this.state.errorModel ? <p>{this.state.errorModel}</p> : undefined}
                    </label>
                  </div>
                  <div className="form__element">
                    <label>Combustibil:
                      <input className={this.state.errorCombustibil ? 'text-input error' : 'text-input'}
                             type="text" ref="combustibil" name="combustibil"
                             onChange={(e) => {if(e.target.value.trim().length >= 2) {
                                                 this.setState({errorCombustibil: ''});
                                               }}}/>
                      {this.state.errorCombustibil ? <p>{this.state.errorCombustibil}</p> : undefined}
                    </label>
                  </div>
                  <div className="form__element">
                    <label>Anul fabricatiei:
                      <input className={this.state.errorAnFabricatie ? 'text-input error' : 'text-input'}
                             type="month" ref="anFabricatie" name="anFabricatie"
                             onChange={(e) => {if(e.target.value) {
                                                 this.setState({errorAnFabricatie: ''});
                                               }}}/>
                      {this.state.errorAnFabricatie ? <p>{this.state.errorAnFabricatie}</p> : undefined}
                    </label>
                  </div>
                  <div className="form__element">
                    <label>Rulaj (km):
                      <input className={this.state.errorRulaj ? 'text-input error' : 'text-input'}
                             type="number" ref="rulaj" name="rulaj"
                             onChange={(e) => {if(e.target.value > 0) {
                                                 this.setState({errorRulaj: ''});
                                               }}}/>
                      {this.state.errorRulaj ? <p>{this.state.errorRulaj}</p> : undefined}
                    </label>
                  </div>
                  <div className="form__element">
                    <label>Capacitate cilindrica (cm<sup>3</sup>):
                      <input className={this.state.errorCapacitate ? 'text-input error' : 'text-input'}
                             type="number" ref="capacitate" name="capacitate"
                             onChange={(e) => {if(e.target.value > 0) {
                                                 this.setState({errorCapacitate: ''});
                                               }}}/>
                      {this.state.errorCapacitate ? <p>{this.state.errorCapacitate}</p> : undefined}
                    </label>
                  </div>
                </div>

                <div style={{display: this.state.showStare}}>
                  <div className="form__element">
                    <select className={this.state.errorStare ? 'text-input error' : 'text-input'}
                           ref="stare" name="stare"
                           onClick={(e) => {if(e.target.value) {
                                               this.setState({errorStare: ''});
                                             }}}>
                      <option value="">Alege starea</option>
                      <option value="Nou">Nou</option>
                      <option value="Utilizat">Utilizat</option>
                    </select>
                  </div>
                </div>

                <div style={{display: this.state.showApartamente}}>
                  <div className="form__element">
                    <select className={this.state.errorCamere ? 'text-input error' : 'text-input'}
                           ref="camere" name="camere"
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
                  <div className="form__element">
                    <label>Suprafata (m<sup>2</sup>):
                      <input className={this.state.errorSuprafataApartament ? 'text-input error' : 'text-input'}
                             type="number" ref="suprafataApartament" name="suprafataApartament"
                             onChange={(e) => {if(e.target.value > 9) {
                                                 this.setState({errorSuprafataApartament: ''});
                                               }}}/>
                      {this.state.errorSuprafataApartament ? <p>{this.state.errorSuprafataApartament}</p> : undefined}
                    </label>
                  </div>
                </div>

                <div style={{display: this.state.showSuprafata}}>
                  <div className="form__element">
                    <label>Suprafata (m<sup>2</sup>):
                      <input className={this.state.errorSuprafata ? 'text-input error' : 'text-input'}
                             type="number" ref="suprafata" name="suprafata"
                             onChange={(e) => {if(e.target.value > 0) {
                                                 this.setState({errorSuprafata: ''});
                                               }}}/>
                      {this.state.errorSuprafata ? <p>{this.state.errorSuprafata}</p> : undefined}
                    </label>
                  </div>
                </div>

                <div style={{display: this.state.showImbracaminte}}>
                  <div className="form__element">
                    <select className={this.state.errorMarime ? 'text-input error' : 'text-input'}
                           ref="marime" name="marime"
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
                  <div className="form__element">
                    <select className={this.state.errorStareImbracaminte ? 'text-input error' : 'text-input'}
                           ref="stareImbracaminte" name="stareImbracaminte"
                           onClick={(e) => {if(e.target.value) {
                                               this.setState({errorStareImbracaminte: ''});
                                             }}}>
                      <option value="">Alege starea</option>
                      <option value="Nou">Nou</option>
                      <option value="Utilizat">Utilizat</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="form__element">
                <label>Descriere:
                  <textarea className={this.state.errorDescription ? 'text-input error' : 'text-input'}
                            ref="description" name="description" placeholder="Descriere" style={{resize: 'none'}}
                            onChange={(e) => {if(e.target.value.trim().length >= 4) {
                                                this.setState({errorDescription: ''});
                                              }}}/>
                  {this.state.errorDescription ? <p>{this.state.errorDescription}</p> : undefined}
                </label>
              </div>

              <div className="form__element form__currency">
                <input className={this.state.errorPrice ? 'text-input error' : 'text-input'}
                       type="number" ref="price" name="price" placeholder="Pret"
                       onChange={(e) => {if(e.target.value >= 1) {
                                           this.setState({errorPrice: ''});
                                         }}}/>

                <select className={this.state.errorCurrency ? 'text-input error' : 'text-input'}
                        ref="currency" name="currency"
                        onClick={(e) => {if(e.target.value) {
                                            this.setState({errorCurrency: ''});
                                          }}}>
                   <option value="">Alege moneda</option>
                   <option value="RON">RON</option>
                   <option value="EUR">EUR</option>
                   <option value="USD">USD</option>
                 </select>

                  <select className={this.state.errorPeriod ? 'text-input error' : 'text-input'}
                         ref="period" name="period"
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

              <div className="form__element">
                <label>Localitate:
                  <input className={this.state.errorCity ? 'text-input error' : 'text-input'}
                         type="text" ref="city" name="city" placeholder="Scrie localitatea ta."
                         onChange={(e) => {if(e.target.value.trim().length >= 3) {
                                             this.setState({errorCity: ''});
                                           }}}/>
                  {this.state.errorCity ? <p>{this.state.errorCity}</p> : undefined}
                </label>
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

              <div className="form__element">
                <Dropzone multiple onDrop={this.onImageDrop} accept="image/*" className="form__dropzone">
                  <h2>Trage imaginile aici sau apasa pentru a le selecta.</h2>
                </Dropzone>
              </div>

              <div className="form__center">
                {this.state.error ? <p>{this.state.error}</p> : undefined}
              </div>

              <div className="form__center">
                <button className="button-submit">Adauga anuntul</button>
              </div>

            </form>

            : <div>
                <h2>Pentru a publica un anunt, adauga informatiile personale !</h2>
                <h2><Link to="/myAccount" onClick={() => {Session.set('displayPersonal', 'block')}}>Editeaza informatiile</Link></h2>
              </div>
          : undefined }


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

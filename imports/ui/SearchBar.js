import React from 'react';

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cities: null
    }
    this.startTracking = this.startTracking.bind(this);
  }

  componentDidMount() {
    Meteor.setTimeout(this.startTracking, 0);
  }

  startTracking() {
    Meteor.setTimeout(() => {
      let cities = [];
      this.props.posts.map((post) => {
        if(!cities.includes(post.city)) {
          cities.push(post.city);
        }
      });
      this.setState({cities});
    }, 1000);
  }

  render() {
    return (
      <div className="search-bar">
        <div className="search-bar__element">

          <form className="search-bar__form">

            <input className="search-bar__input" ref="city" type="text" placeholder="Localitate" list="cities"/>

            <datalist id="cities">
              {this.state.cities !== null ?
                this.state.cities.map((city) => {
                  return <option key={city}>{city}</option>
                })
              : undefined}
            </datalist>

            <select className="search-bar__input" ref="category" name="category" onChange={(e) => {Session.set('category', e.target.value)}}>

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

            <input className="search-bar__input" ref="keyword" type="text" placeholder="Cuvant-cheie" list="keywords"/>

            <datalist id="keywords">
              {this.props.posts.map((post) => {
                return <option key={post._id}>{post.title}</option>
              })}
            </datalist>

            <input className="search-bar__input" type="number" ref="maxPrice" placeholder="Pretul maxim"/>
            <select className="search-bar__input" ref="currency" onChange={(e) => {Session.set('currency', e.target.value)}}>
              <option value="">Alege moneda</option>
              <option value="RON">RON</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>

            <button className="button" onClick={(e) => {
              e.preventDefault();
              Meteor.call('users.addSearch', this.refs.city.value, this.refs.category.value, this.refs.keyword.value,
                          this.refs.maxPrice.value, this.refs.currency.value);
              Session.set('city', this.refs.city.value);
              Session.set('keyword', this.refs.keyword.value);
              Session.set('maxPrice', this.refs.maxPrice.value);
              this.refs.city.value='';
              this.refs.category.value='';
              this.refs.keyword.value='';
              this.refs.maxPrice.value='';
              this.refs.currency.value='';}}>Cauta</button>
          </form>
        </div>

        <div className="search-bar__checkbox">
          <label className="checkbox">
            <input className="checkbox__box" type="checkbox" checked={Session.get('isAvailable')}
              onChange={(e) => {Session.set('isAvailable', e.target.checked)}}/>
              Arata doar anunturile disponibile
          </label>

          <label className="checkbox">
            <input className="checkbox__box" type="checkbox" checked={Session.get('showMyPosts')}
              onChange={(e) => {Session.set('showMyPosts', e.target.checked)}}/>
              Arata anunturile mele
          </label>
        </div>
      </div>
    );
  }
}

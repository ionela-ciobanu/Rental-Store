import {Meteor} from 'meteor/meteor';
import React from 'react';
import {Tracker} from 'meteor/tracker';

export default class PersonalInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      error: '',
      userData: {},
      displayPersonal: 'none'
    }
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    var handle = Meteor.subscribe('userData');
    this.userTracker = Tracker.autorun(() => {
      if(handle.ready()) {
        const userData = Meteor.users.findOne({});
        this.setState({userData}, () => {
          console.log(this.state.userData);
        });
      }
    });
  }

  componentWillUnmount() {
    this.userTracker.stop();
  }

  onSubmit(e) {
    e.preventDefault();

    let lastName = this.refs.lastName.value.trim();
    let firstName = this.refs.firstName.value.trim();
    let address = this.refs.address.value.trim();
    let phone = this.refs.phone.value.trim();

    const error = false;

    if(lastName.length < 3) {
      this.setState({errorLastName: 'Numele este prea scurt.'});
      error = true;
    }

    if(firstName.length < 3) {
      this.setState({errorFirstName: 'Prenumele este prea scurt.'});
      error = true;
    }

    if(address.length < 3) {
      this.setState({errorAddress: 'Adresa nu este corecta.'});
      error = true;
    }

    if(phone.length < 10) {
      this.setState({errorPhone: 'Numarul de telefon nu este valid'});
      error = true;
    }

    if(!error) {
      this.setState({error: ''});

      Meteor.call('users.update', lastName, firstName, address, phone);
      this.setState({displayPersonal: 'none'});
    } else {
      this.setState({error: 'Verifica datele introduse !'});
    }
  }

  render () {
    return (
      <div className="account__function">
        <div className="account__title">
          <h3>Editeaza informatiile personale</h3>
          <img src={this.state.displayPersonal === 'none' ? '/arrow-down.png' : '/arrow-up.png'}
            onClick={() => {this.state.displayPersonal === 'none' ? this.setState({displayPersonal: 'block'}) :
                                                                    this.setState({displayPersonal: 'none'})}}/>
        </div>
        <div className="account__content" style={{display: this.state.displayPersonal}}>

          {this.state.userData !== undefined && this.state.userData.personalInfo !== undefined?
            <form onSubmit={this.onSubmit}>
              {this.state.userData.personalInfo.firstName}
              <label>Email:
                <input readOnly className="text-input" type="email"
                    defaultValue={this.state.userData.emails[0].address}/>
              </label>

              {this.state.errorLastName ? <p>{this.state.errorLastName}</p> : undefined}
              <input className={this.state.errorLastName ? 'text-input error' : 'text-input'}
                type="text" ref="lastName" name="lastName"
                placeholder="Nume"
                defaultValue={this.state.userData.personalInfo.lastName}
                onChange={(e) => {if(e.target.value.length >= 3) {
                                    this.setState({errorLastName: ''});
                                 }}}/>

              {this.state.errorFirstName ? <p>{this.state.errorFirst}</p> : undefined}
                <input className={this.state.errorFirstName ? 'text-input error' : 'text-input'}
                  type="text" ref="firstName" name="firstName" placeholder="Prenume"
                  defaultValue={this.state.userData.personalInfo.firstName}
                  onChange={(e) => {if(e.target.value.length >= 3) {
                                      this.setState({errorFirstName: ''});
                                   }}}/>

              <label>Data nasterii:
                {this.state.userData !== undefined ?
                  <input readOnly className="text-input" type="date"
                    defaultValue={this.state.userData.profile !== undefined ?
                      this.state.userData.profile.birthday : ""}
                    onChange={() => {}}/>
                : undefined}
              </label>

              {this.state.errorAddress ? <p>{this.state.errorAddress}</p> : undefined}
                <input className={this.state.errorAddress ? 'text-input error' : 'text-input'}
                  type="text" ref="address" name="address" placeholder="Adresa"
                  defaultValue={this.state.userData.personalInfo.address}
                  onChange={(e) => {if(e.target.value.length >= 3 ) {
                                      this.setState({errorAddress: ''});
                                   }}}/>

              {this.state.errorPhone ? <p>{this.state.errorPhone}</p> : undefined}
                <input className={this.state.errorPhone ? 'text-input error' : 'text-input'}
                  type="tel" ref="phone" name="phone" placeholder="Numarul de telefon"
                  defaultValue={this.state.userData.personalInfo.phone}
                  onChange={(e) => {if(e.target.value.length >= 10) {
                                      this.setState({errorPhone: ''});
                                   }}}/>

               <div className="form__center">
                 {this.state.error ? <p>{this.state.error}</p> : undefined}
               </div>

              <button className="button-submit">Salveaza modificarile</button>
            </form>
            : undefined
          }
        </div>
      </div>
    );
  }
}

import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import React from 'react';

export default class PersonalInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      error: '',
      userData: {}
    }
    this.onSubmit = this.onSubmit.bind(this);
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
      Session.set({displayPersonal: 'none'});
    } else {
      this.setState({error: 'Verifica datele introduse !'});
    }
  }

  render () {
    return (
      <div className="account__function">
        <div className="account__title" onClick={() => {Session.get('displayPersonal') === 'none' ? Session.set('displayPersonal', 'block') :
                                                                Session.set('displayPersonal', 'none')}}>
          <h3>Editeaza informatiile personale</h3>
          <img src={Session.get('displayPersonal') === 'none' ? '/arrow-down.png' : '/arrow-up.png'}/>
        </div>
        <div className="account__content" style={{display: Session.get('displayPersonal')}}>

          {this.state.userData !== undefined && this.state.userData.personalInfo !== undefined?
            <form onSubmit={this.onSubmit}>
              <label>Email:
                <input readOnly className="text-input" type="email"
                    defaultValue={this.state.userData.emails[0].address}/>
              </label>

              <label>Nume utilizator:
                <input readOnly className="text-input" type="text"
                    defaultValue={this.state.userData.username} />
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

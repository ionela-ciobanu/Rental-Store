import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import React from 'react';
import SimpleSchema from 'simpl-schema';
import shortid from 'shortid';

import {Emails} from '../api/emails';

export default class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      showCode: 'none'
    };
    this.validateEmail = this.validateEmail.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.codeVerification = this.codeVerification.bind(this);
  }

  validateEmail(email) {
    var schema = new SimpleSchema({
      email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email
      }
    });
    try {
      schema.validate({email});
      return true;
    } catch(error) {
      return false;
    }
  }

  codeVerification(e) {
    e.preventDefault();

    let address = this.refs.email.value.trim();
    let password = this.refs.password.value.trim();
    let password2 = this.refs.password2.value.trim();
    let codeReset = this.refs.codeReset.value.trim();

    const error = false;

    if(password.length < 6) {
      this.setState({errorPassword: 'Parola trebuie sa contina cel putin 6 caractere.'});
      error = true;
    }
    if(password !== password2) {
      this.setState({errorPassword2: 'Parolele nu corespund.'});
      error = true;
    }

    if(codeReset.length === 0) {
      this.setState({errorCode: ' '});
      error = true;
    }

    if(!error) {
      const handleEmails = Meteor.subscribe('emails', address);
      Tracker.autorun(() => {
        if(handleEmails.ready()) {
          const email = Emails.findOne({});
          if(email) {
            if(codeReset === email.codeReset) {
              Meteor.call('users.resetPassword', address, password , (err, res) => {
                if(!err) {
                  Meteor.loginWithPassword(address, password);
                }
              });
            } else {
              alert('Codul nu este corect !');
            }
          }
        }
      });
    }
  }

  onSubmit(e) {
    e.preventDefault();

    let email = this.refs.email.value.trim();
    const error = false;

    if(!this.validateEmail(email)) {
      this.setState({errorEmail: 'Email-ul nu este corect.'});
      error = true;
    }

    if(!error) {
      const codeReset = shortid.generate();

      Meteor.call('sendEmail', email, 'support@rentalstore.com', 'Rental Store - Reset your password', `Codul de resetare a parolei este: ${codeReset}`, (err, res) => {
        if(!err) {
          Meteor.call('emails.insertCodeReset', email, codeReset, (err, res) => {
            if (!err) {
              this.setState({showCode: 'block'});
            }
          });

        } else {
          alert('Email-ul de resetare NU a fost trimis.');
        }
      });
    }
  }

  render() {
    return (
      <div>
        <h1>Reseteaza Parola</h1>

        <form noValidate="true" onSubmit={this.onSubmit} className="boxed-view__form" >

          {this.state.error ? <p>{this.state.error}</p> : undefined}
          {this.state.errorEmail ? <p>{this.state.errorEmail}</p> : undefined}
          <input type="email" ref="email" name="email" placeholder="Email"
                 className={this.state.errorEmail ? 'text-input error' : 'text-input'}
                 onChange={(e) => {if(this.validateEmail(e.target.value.trim())) {
                                    this.setState({errorEmail: ''});
                                  }}}/>
          <button className="button">Trimite email-ul de resetare</button>
        </form>


        <form noValidate="true" onSubmit={this.codeVerification} className="boxed-view__form" style={{display: this.state.showCode}}>

          <p>Vei primi un email cu codul de resetare (verifica si folder-ul <i>spam</i>). Introdu codul mai jos si reseteaza-ti parola !</p>
          {this.state.errorCode ? <p>{this.state.errorCode}</p> : undefined}
          <input className={this.state.errorCode ? 'text-input error' : 'text-input'}
                 type="text" ref="codeReset" name="codeReset" placeholder="Cod"
                 style={{display: this.state.showCode}}
                 onChange={(e) => {if(e.target.value.trim().length > 0) {
                                    this.setState({errorCode: ''});
                                  }}}/>

          {this.state.errorPassword ? <p>{this.state.errorPassword}</p> : undefined}
          <input type="password" ref="password" name="password" placeholder="Parola"
                 className={this.state.errorPassword ? 'text-input error' : 'text-input'}
                 onChange={(e) => {if(e.target.value.trim().length >= 6) {
                                    this.setState({errorPassword: ''});
                                  }}}/>

          {this.state.errorPassword2 ? <p>{this.state.errorPassword2}</p> : undefined}
          <input type="password" ref="password2" name="password2" placeholder="Verifica parola"
                 className={this.state.errorPassword2 ? 'text-input error' : 'text-input'}
                 onChange={(e) => {if(e.target.value.trim() === this.refs.password.value.trim()) {
                                    this.setState({errorPassword2: ''});
                                  }}}/>

          <button className="button">Reseteaza parola</button>

        </form>
      </div>
    );
  }
}

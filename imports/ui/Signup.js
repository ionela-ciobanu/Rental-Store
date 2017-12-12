import React from 'react';
import {Link} from 'react-router-dom';
import {Accounts} from 'meteor/accounts-base';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';

export default class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
    this.validateEmail = this.validateEmail.bind(this);
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

  onSubmit(e) {
    e.preventDefault();

    let email = this.refs.email.value.trim();
    let password = this.refs.password.value.trim();
    let password2 = this.refs.password2.value.trim();
    let birthday = moment(this.refs.birthday.value);
    let today = moment();
    const error = false;

    if(!this.validateEmail(email)) {
      this.setState({errorEmail: 'Email-ul nu este corect.'});
      error = true;
    }

    if(password.length < 6) {
      this.setState({errorPassword: 'Parola trebuie sa contina cel putin 6 caractere.'});
      error = true;
    }
    if(password !== password2) {
      this.setState({errorPassword2: 'Parolele nu corespund.'});
      error = true;
    }

    if (!birthday.valueOf()) {
      this.setState({errorBirthday: 'Data introdusa nu este valida.'});
      error = true;
    } else if(today.diff(birthday,'years') < 14) {
      this.setState({errorBirthday: 'Varsta minima este de 14 ani.'})
      error = true;
    }

    if(!error) {
      Accounts.createUser({email, password}, (err) => {
        if(err) {
          this.setState({error: err.reason});
        } else {
          this.setState({error: ''});
        }
      });
    }
  }

  render() {
    return (
      <div>
        <h1>Inregistrare</h1>

        <form onSubmit={this.onSubmit.bind(this)} noValidate className="boxed-view__form">

          {this.state.error ? <p>{this.state.error}</p> : undefined}
          {this.state.errorEmail ? <p>{this.state.errorEmail}</p> : undefined}
          <input className={this.state.errorEmail ? 'text-input error' : 'text-input'}
                 type="email" ref="email" name="email" placeholder="Email"
                 onChange={(e) => {if(this.validateEmail(e.target.value.trim())) {
                                    this.setState({errorEmail: ''});
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

          <label>Ziua de nastere:
            {this.state.errorBirthday ? <p>{this.state.errorBirthday}</p> : undefined}
            <input type="date" ref="birthday" name="birthday"
                   className={this.state.errorBirthday ? 'text-input error' : 'text-input'}
                   onChange={(e) => {if(moment(e.target.value).valueOf() && moment().diff(moment(e.target.value),'years') >= 14) {
                                      this.setState({errorBirthday: ''});
                                    }}}/>
          </label>

          <button className="button">Creaza cont</button>
        </form>
      </div>
    );
  }
}

import React from 'react';
import {Meteor} from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

export default class Login extends React.Component {
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
    const error = false;

    if(!this.validateEmail(email)) {
      this.setState({errorEmail: 'Email-ul nu este corect.'});
      error = true;
    }

    if(password.length < 6) {
      this.setState({errorPassword: 'Parola trebuie sa contina cel putin 6 caractere.'});
      error = true;
    }

    if(!error) {
      Meteor.loginWithPassword(email, password, (err) => {
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
        <h1>Autentificare</h1>

        <form noValidate="true" onSubmit={this.onSubmit.bind(this)} className="boxed-view__form" >

          {this.state.error ? <p>{this.state.error}</p> : undefined}
          {this.state.errorEmail ? <p>{this.state.errorEmail}</p> : undefined}
          <input type="email" ref="email" name="email" placeholder="Email"
                 className={this.state.errorEmail ? 'text-input error' : 'text-input'}
                 onChange={(e) => {if(this.validateEmail(e.target.value.trim())) {
                                    this.setState({errorEmail: ''});
                                  }}}/>

          {this.state.errorPassword ? <p>{this.state.errorPassword}</p> : undefined}
          <input type="password" ref="password" name="password" placeholder="Parola"
                 className={this.state.errorPassword ? 'text-input error' : 'text-input'}
                 onChange={(e) => {if(e.target.value.trim().length >= 6) {
                                    this.setState({errorPassword: ''});
                                  }}}/>

          <button className="button">Intra in cont</button>

        </form>
      </div>
    );
  }
}

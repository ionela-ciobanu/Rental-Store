import React from 'react';
import Modal from 'react-modal';

import Login from './Login';
import Signup from './Signup';

export default class PublicHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      loginOpen: false,
      signupOpen: false
    }
  }
  handleModalClose() {
    this.setState({isOpen: false, loginOpen: false, signupOpen: false});
  }
  render() {
    return (
      <div>

        <div className="header">
          <div className="header__content">
            <h1 className="header__title">Rental Store</h1>

            <div>
              <button className="button" onClick={() => this.setState({isOpen: true, loginOpen: true})}>Intra in cont</button>
              <button className="button" onClick={() => this.setState({isOpen: true, signupOpen: true})}>Inregistrare</button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={this.state.isOpen}
          contentLabel="Login"
          // onAfterOpen={() => {this.refs.email.focus()}}
          onRequestClose={this.handleModalClose.bind(this)}
          className="boxed-view__box"
          overlayClassName="boxed-view boxed-view--modal">

          {this.state.loginOpen ?
            <div>
              <Login/>
              <button className="button button--link-text" onClick={() => {this.setState({loginOpen: false})}} style={{color: 'black'}}>Ai nevoie de un cont?</button>
            </div> :
            <div>
              <Signup/>
              <button className="button button--link-text" onClick={() => {this.setState({loginOpen: true})}} style={{color: 'black'}}>Ai deja un cont?</button>
            </div>
          }

          <button type="button" className="button header__cancel" onClick={this.handleModalClose.bind(this)}>Inchide</button>
        </Modal>
      </div>
    );
  }
}

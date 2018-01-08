import React from 'react';
import Modal from 'react-modal';

import Login from './Login';
import Signup from './Signup';
import ResetPassword from './ResetPassword';

export default class PublicHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      content: 0
    }
  }
  handleModalClose() {
    this.setState({isOpen: false, content: 0});
  }
  render() {
    return (
      <div>

        <div className="header">
          <div className="header__content">
            <h1 className="header__title">Rental Store</h1>

            <div>
              <button className="button" onClick={() => this.setState({isOpen: true, content: 1})}>Intra in cont</button>
              <button className="button" onClick={() => this.setState({isOpen: true, content: 2})}>Inregistrare</button>
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

          {this.state.content === 1 ?
            <div>
              <Login/>
              <button className="button button--link-text" onClick={() => {this.setState({content: 2})}} style={{color: 'black'}}>Ai nevoie de un cont?</button>
              <button className="button button--link-text" onClick={() => {this.setState({content: 3})}} style={{color: 'black'}}>Ai uitat parola?</button>
            </div> : this.state.content === 2 ?
            <div>
              <Signup/>
              <button className="button button--link-text" onClick={() => {this.setState({content: 1})}} style={{color: 'black'}}>Ai deja un cont?</button>
            </div> :
            <div>
              <ResetPassword/>
            </div>
          }

          <button type="button" className="button header__cancel" onClick={this.handleModalClose.bind(this)}>Inchide</button>
        </Modal>
      </div>
    );
  }
}

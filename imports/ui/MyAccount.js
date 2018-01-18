import {Meteor} from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';

import PrivateHeader from './PrivateHeader';
import MyMessages from './MyMessages';
import PersonalInfo from './PersonalInfo';
import MyPosts from './MyPosts';

export default class MyAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteIsOpen : false
    }
  }

  render() {
    return (
      <div>
        <PrivateHeader title="Rental Store"/>

        <div className="page__content">

          <MyMessages/>
          <PersonalInfo/>
          <MyPosts/>

          <button onClick={() => {this.setState({deleteIsOpen: true})}}>Dezactiveaza contul</button>
        </div>

        <Modal
          isOpen={this.state.deleteIsOpen}
          contentLabel="Sterge contul"
          onRequestClose={() => {this.setState({deleteIsOpen: false})}}
          className="boxed-view__box"
          overlayClassName="boxed-view boxed-view--modal">
          <div>
            <h3>Odata cu contul, vor fi sterse toate anunturile si mesajele tale. Esti sigur ca vrei sa dezactivezi contul ?</h3>
            <div className="account__title">
              <button className="button" onClick={() => {Meteor.call('posts.deleteAllPosts', (err, res) => {
                                                          if(!err) {
                                                            Meteor.call('users.deleteAccount');
                                                          }
                                                        });
                                                        this.setState({deleteIsOpen:false})}}>Dezactiveaza</button>
              <button className="button" onClick={() => {this.setState({deleteIsOpen: false})}}>Anuleaza</button>
            </div>
          </div>
        </Modal>

      </div>
    );
  }
}

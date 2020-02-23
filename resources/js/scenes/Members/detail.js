import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, Button, Input, Label
} from 'reactstrap';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

class MemberDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
  }

  async componentDidMount() {
    const data = await Api.get('profile');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          user: body
        });
        break;
      case 406:
        break;
      default:
        break;
    }
  }

  render() {
    const { user } = this.state;
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container>
            <div>
              Welcome to
              {' '}
              {user.first_name}
              {' '}
              {user.mid_name}
              {' '}
              {user.last_name}
            </div>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default MemberDetail;
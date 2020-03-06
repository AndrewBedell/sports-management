import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, Button, Input, Label
} from 'reactstrap';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

import { Genders } from '../../configs/data';
import Bitmaps from '../../theme/Bitmaps';

class Profile extends Component {
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
            <Row>
              <Col xs="12" sm="6" md="4" lg="3">
                <div className="avatar-preview">
                  <img src={user.profile_image ? user.profile_image : Bitmaps.logo} />
                </div>
              </Col>
              <Col xs="12" sm="6" md="8" lg="9">
                <h5>
                  Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {user.surname} {user.patronymic != '-' && user.patronymic} {user.name}
                </h5>
                <h5>
                  Gender:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {user.gender == 1 ? Genders[0].name : Genders[1].name}
                </h5>
                <h5>
                  Birthday:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{user.birthday}
                </h5>
                <h5>
                  Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{user.email}
                </h5>
                <hr />
                <h5>
                  Organization:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{user.name_o}
                </h5>
                <h5>
                  Role:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{user.role}
                </h5>
                <h5>
                  Register Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{user.register_date}
                </h5>
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default Profile;

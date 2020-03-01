import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import { Segment, Image } from 'semantic-ui-react'
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import Bitmaps from '../../theme/Bitmaps';
import { countries } from '../../configs/data';

class MemberDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      member: {}
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

    let mem_id = this.props.location.state;
    const mem_data = await Api.get(`member/${mem_id}`);
    
    switch (mem_data.response.status) {
      case 200:
        this.setState({
          member: mem_data.body
        });
        break;
      case 406:
        break;
      default:
        break;
    }
  }

  render() {
    const { user, member } = this.state;
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content detail">
          <Container>
            <div>
              Welcome to
              {' '}
              {user.name}
              {' '}
              {user.patronymic}
              {' '}
              {user.surname}
            </div>
            <Segment>
              <Row>
                <Col sm="4">
                  <Image className="m-auto" src={member.logo ? member.logo : Bitmaps.logo} size='small' />
                </Col>
                <Col sm="8">
                  {
                    member.is_player ? (
                      <Fragment>
                        <h4 className="pt-3 pb-2"><b>Name</b>: {member.name} {member.patronymic} {member.surname}</h4>
                        <h4 className="py-2"><b>Club Name</b>: {member.name_o}</h4>
                        <h4 className="py-2"><b>Role</b>: {member.role_name}</h4>
                        <h4 className="py-2"><b>Gender</b>: {member.gender? 'Male': "Female"}</h4>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <h4 className="pt-3 pb-2"><b>Name</b>: {member.name} {member.patronymic} {member.surname}</h4>
                        <h4 className="py-2"><b>Organization Name</b>: {member.name_o}</h4>
                        <h4 className="py-2"><b>Role</b>: {member.role_name}</h4>
                      </Fragment>
                    )
                  }
                </Col>
              </Row>
              <Row>
                <Col sm="6"><h4 className="px-5 pt-5"><b>Register Date</b>: {member.register_date}</h4></Col>
                <Col sm="6"><h4 className="px-5 pt-5"><b>Birthday</b>: {member.birthday}</h4></Col>
              </Row>
              <Row>
                <Col sm="6">
                  <h4 className="px-5 pt-5">
                    <b>Email</b>: <a href={"mailto:" + member.email}>{member.email}</a>
                  </h4>
                </Col>
                <Col sm="6"><h4 className="px-5 pt-5"><b>Mobile</b>: {member.mobile}</h4></Col>
              </Row>
              {member.is_player && (
                <Row>
                  <Col sm="6"><h4 className="px-5 pt-5"><b>Weight</b>: {member.weight_name}, {member.weight} Kg</h4></Col>
                  <Col sm="6"><h4 className="px-5 pt-5"><b>Dan</b>: {member.dan}</h4></Col>
                </Row>
              )}
              <Row>
                <Col sm="12">
                  <h4 className="px-5 pt-5">
                    <b>Address</b>: {(member.addressline1 && member.addressline1 != '' && member.addressline1 != '-') ? member.addressline1 + ', ' : '' }
                    {(member.addressline2 && member.addressline2 != '' && member.addressline2 != '-') ? member.addressline2 + ', ' : '' }
                    {(member.city && member.city != '' && member.city != '-') ? member.city + ', ' : '' }
                    {(member.state && member.state != '' && member.state != '-') ? member.state + ', ' : '' }
                    {member.zip_code}
                  </h4>
                </Col>
              </Row>
            </Segment>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default MemberDetail;

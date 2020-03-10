import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import { Segment, Image } from 'semantic-ui-react';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import Bitmaps from '../../theme/Bitmaps';

class MemberDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      member: {}
    };
  }

  async componentDidMount() {

    const mem_id = this.props.location.state;
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
    const { member } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content detail">
          <Container>
            <Segment>
              <Row>
                <Col lg="3">
                  <div className="detail-image">
                    <Image className="m-auto" src={member.profile_image ? member.profile_image : (member.gender == 1 ? Bitmaps.maleAvatar : Bitmaps.femaleAvatar)} />
                  </div>
                </Col>
                <Col lg="9">
                  {
                    member.is_player == 1 ? (
                      <Fragment>
                        <Row>
                          <Col sm="12">
                            <h5 className="pt-3 py-2">
                              <b>Culb Name</b>
                              :
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {member.name_o}
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              ( Region:&nbsp;&nbsp;
                              {member.region}
                              {' '}
                              )
                            </h5>
                          </Col>
                          <Col md="6" lg="8">
                            <h5 className="py-2">
                              <b>Name</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {member.name}
                              {' '}
                              {member.patronymic != '-' && member.patronymic}
                              {' '}
                              {member.surname}
                            </h5>
                          </Col>
                          <Col md="6" lg="4">
                            <h5 className="py-2">
                              <b>Gender</b>
                              :
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              { member.gender == 1 ? 'Male' : 'Female' }
                            </h5>
                          </Col>
                        </Row>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <Row>
                          <Col sm="6">
                            <h5 className="pt-3 pb-2">
                              <b>Name</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {member.name}
                              {' '}
                              {member.patronymic != '-' && member.patronymic}
                              {' '}
                              {member.surname}
                            </h5>
                          </Col>
                          <Col sm="6">
                            <h5 className="py-2">
                              <b>Register Date</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {member.register_date}
                            </h5>
                          </Col>
                          <Col sm={member.role_id == 1 || member.role_id == 4 ? '6' : '12'}>
                            {member.role_id == 2 ? (
                              <h5 className="py-2">
                                <b>Club Name</b>
                                  :
                                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.name_o}
                                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;( Region:&nbsp;&nbsp;
                                {member.region}
                                {' '}
                                )
                              </h5>
                            ) : (
                              <h5 className="py-2">
                                <b>Regional Federation Name</b>
                                :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {member.name_o}
                              </h5>
                            )}
                          </Col>
                          {
                            (member.role_id == 1 || member.role_id == 4) && (
                              <Col sm="6">
                                <h5 className="py-2">
                                  <b>{member.role_id == 1 ? 'Position' : 'Referee Type'}</b>
                                  :
                                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                  {member.position == '' ? '---' : member.position}
                                </h5>
                              </Col>
                            )
                          }
                          <Col sm="4">
                            <h5 className="py-2">
                              <b>Birthday</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {member.birthday}
                            </h5>
                          </Col>
                          <Col sm="4">
                            <h5 className="py-2">
                              <b>Gender</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {member.gender == 1 ? 'Male' : 'Female'}
                            </h5>
                          </Col>
                          <Col sm="4">
                            <h5 className="py-2">
                              <b>Role</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {member.role_name}
                            </h5>
                          </Col>
                        </Row>
                      </Fragment>
                    )
                  }
                  <Row>
                    <Col md="12" lg="8">
                      <h5 className="py-2">
                        <b>Email</b>
                        :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <a href={`mailto:${member.email}`}>{member.email}</a>
                      </h5>
                    </Col>
                    <Col md="12" lg="4">
                      <h5 className="py-2">
                        <b>Mobile</b>
                        :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {member.mobile}
                      </h5>
                    </Col>
                    <Col sm="12">
                      <h5 className="py-2">
                        <b>Address</b>
                        :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {(member.addressline1 && member.addressline1 != '' && member.addressline1 != '-') ? `${member.addressline1}, ` : '' }
                        {(member.addressline2 && member.addressline2 != '' && member.addressline2 != '-') ? `${member.addressline2}, ` : '' }
                        {(member.city && member.city != '' && member.city != '-') ? `${member.city}, ` : '' }
                        {(member.state && member.state != '' && member.state != '-') ? `${member.state}, ` : '' }
                        {member.zip_code}
                      </h5>
                    </Col>
                  </Row>
                  {member.is_player == 1 ? (
                    <Row>
                      <Col sm="8">
                        <h5 className="py-2">
                          <b>Weight</b>
                          :
                          {' '}
                          {member.weight}
                          {' '}
                          Kg
                        </h5>
                      </Col>
                      <Col sm="4">
                        <h5 className="py-2">
                          <b>Dan</b>
                          :
                          {' '}
                          {member.dan}
                        </h5>
                      </Col>
                    </Row>
                  ) : ''}
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

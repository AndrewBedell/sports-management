import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import { Segment, Image } from 'semantic-ui-react'
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import Bitmaps from '../../theme/Bitmaps';
import { countries } from '../../configs/data';
import SubTable from '../../components/SubTable';

class OrganizationDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      org: {},
      type: '',
      data: []
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

    let org_id = this.props.location.state;
    
    const org_data = await Api.get(`organization/${org_id}`);
    
    switch (org_data.response.status) {
      case 200:
        this.setState({
          org: org_data.body,
          type: org_data.body.type,
          data: org_data.body.table
        });
        
        break;
      case 406:
        break;
      default:
        break;
    }
  }

  async handleSelectItem(id) {
    let option = this.state.type;

    if (option == 'org') {
      const sub_data = await Api.get(`organization/${id}`);
    
      switch (sub_data.response.status) {
        case 200:
          this.setState({
            org: sub_data.body,
            type: sub_data.body.type,
            data: sub_data.body.table
          });
          
          break;
        case 406:
          break;
        default:
          break;
      }
    }

    if (option == 'club') {
      this.props.history.push('/member/detail', id);
    }
  }

  render() {
    const { user, org, type, data } = this.state;
    
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
            <Row>
              <Col md={org.is_club ? 12 : 8}>
                <Segment>
                  <Row>
                    <Col md="6" lg="3">
                      <Image className="m-auto" src={org.logo ? org.logo : Bitmaps.logo} size='small' />
                    </Col>
                    <Col md="6" lg="9">
                      <h5 className="py-2">
                        <b>{ org.is_club ? "Club Name" : "Regional Federation Name" }</b>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {org.name_o} ({org.name_s})
                      </h5>
                      <h5 className="py-2"><b>Register No</b>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{org.register_no}</h5>
                      <Row>
                        <Col sm="12" md="8" lg="9">
                          <h5 className="py-2">
                            <b>Email</b>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <a href={"mailto:" + org.email}>{org.email}</a>
                          </h5>
                        </Col>
                        <Col sm="12" md="4" lg="3">
                          <h5 className="py-2"><b>Phone</b>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{org.mobile}</h5>
                        </Col>
                      </Row>
                      <h5 className="py-2">
                        <b>Address</b>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {(org.addressline1 && org.addressline1 != '' && org.addressline1 != '-') ? org.addressline1 + ', ' : '' }
                        {(org.addressline2 && org.addressline2 != '' && org.addressline2 != '-') ? org.addressline2 + ', ' : '' }
                        {(org.city && org.city != '' && org.city != '-') ? org.city + ', ' : '' }
                        {(org.state && org.state != '' && org.state != '-') ? org.state + ', ' : '' }
                        {org.zip_code}
                      </h5>
                    </Col>
                  </Row>
                </Segment>
              </Col>
              {
                !org.is_club && (
                  <Col md="4">
                    <Segment>
                      <h4 className="text-center"><b>Summary</b></h4>
                      <Row>
                        <Col sm="12">
                          <h5 className="py-2">President:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{org.president}</h5>
                        </Col>
                        <Col sm="12">
                          <h5 className="py-2">Clubs:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{org.clubs}</h5>
                        </Col>
                        <Col sm="12">
                          <h5 className="py-2">
                            Judokas:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{org.players}&nbsp;&nbsp;
                            (Male:&nbsp;&nbsp;{org.mplayers},&nbsp;&nbsp;Female:&nbsp;&nbsp;{org.fplayers})
                          </h5>
                        </Col>
                      </Row>
                    </Segment>
                  </Col>
                )
              }
            </Row>
          </Container>
          <Container>
            <div className="table-responsive">
              <SubTable
                type={type}
                items={data}
                onSelect={this.handleSelectItem.bind(this)}
              />
            </div>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default OrganizationDetail;

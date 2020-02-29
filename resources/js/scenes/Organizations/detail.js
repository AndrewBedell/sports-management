import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import { Segment, Image } from 'semantic-ui-react'
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import Bitmaps from '../../theme/Bitmaps';
import { countries } from '../../configs/data';

class OrganizationDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      org: {}
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
          org: org_data.body
        });
        break;
      case 406:
        break;
      default:
        break;
    }
  }

  render() {
    const { user, org } = this.state;
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
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
                  <Image className="m-auto" src={org.logo ? org.logo : Bitmaps.logo} size='small' />
                </Col>
                <Col sm="8">
                  <h4 className="pt-3 pb-2">Federation: {org.parent}</h4>
                  <h4 className="py-2">
                    { org.is_club ? "Club Name: " : "Orgnaization Name: " }
                    {org.name_o} ({org.name_s})
                  </h4>
                  <h4 className="py-2">Register No: {org.register_no}</h4>
                </Col>
              </Row>
              <Row>
                <Col sm="6"><h4 className="px-5 pt-5">Email: {org.email}</h4></Col>
                <Col sm="6"><h4 className="px-5 pt-5">Mobile: {org.mobile}</h4></Col>
              </Row>
              <Row>
                <Col sm="12">
                  <h4 className="px-5 pt-5">
                    Address: {org.addresslin1}, {org.addressline2}, {org.city},&nbsp;
                    {countries.filter(country => country.countryCode === org.country).length > 0 && 
                    countries.filter(country => country.countryCode === org.country)[0].name}, {org.state}, {org.zip_code}
                  </h4>
                </Col>
                <Col sm="12">
                  <h4 className="px-5 pt-5">
                    Readable ID: {org.readable_id}
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

export default OrganizationDetail;

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
    console.log(org_id);
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

  handleSelectItem(id) {
    this.props.history.push('/organization/detail', id);
  }

  render() {
    const { user, org, type, data } = this.state;
    
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
                  <h4 className="py-2">
                    { org.is_club ? "Club Name: " : "Regional Federation Name: " }
                    {org.name_o} ({org.name_s})
                  </h4>
                  <h4 className="py-2">Register No: {org.register_no}</h4>
                  <h4 className="py-2">Email: {org.email}</h4>
                  <h4 className="py-2">Phone: {org.mobile}</h4>
                  <h4 className="py-2">
                    Address: {(org.addressline1 && org.addressline1 != '' && org.addressline1 != '-') ? org.addressline1 + ', ' : '' }
                    {(org.addressline2 && org.addressline2 != '' && org.addressline2 != '-') ? org.addressline2 + ', ' : '' }
                    {(org.city && org.city != '' && org.city != '-') ? org.city + ', ' : '' }
                    {(org.state && org.state != '' && org.state != '-') ? org.state + ', ' : '' }
                    {org.zip_code}
                  </h4>
                </Col>
              </Row>
            </Segment>
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

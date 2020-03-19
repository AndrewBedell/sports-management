/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import { 
  Row, Col, Button, Table
} from 'reactstrap';
import { Segment, Image } from 'semantic-ui-react';
import Bitmaps from '../../theme/Bitmaps';
import Api from '../../apis/app';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import {
  withRouter
} from 'react-router-dom';

class NFProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nf: []
    };
  }

  async componentDidMount() {
    const nf_id = this.props.location.state;
    
    const org = await Api.get(`organization/${nf_id}`);
    const { response, body } = org;
    switch (response.status) {
      case 200:
        this.setState({
          nf: body
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { nf } = this.state;
    
    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <div className="text-right my-5">
              <Button 
                outline
                color="info"
                onClick={() => this.props.history.push('/admin/federations')}
              >
                <i className="fa fa-arrow-left fa-lg"></i>
              </Button>
            </div>

            <h3 className="text-center text-info mb-5"><b>{nf.name_o}</b></h3>

            <div className="content">
              <Row>
                <Col sm="8">
                  <Segment>
                    <Row>
                      <Col md="6" lg="3">
                        <div className="detail-image">
                          <Image className="m-auto" src={nf.logo ? nf.logo : Bitmaps.logo} />
                        </div>
                      </Col>
                      <Col md="6" lg="9">
                        <h5 className="py-2">
                          <b>Name</b>
                          :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {nf.name_o}
                          {' '}
                          (
                          {nf.name_s}
                          )&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {nf.is_club ? (` (Regional Federation: ${nf.parent}) `) : ''}
                        </h5>
                        <h5 className="py-2">
                          <b>Register No</b>
                          :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {nf.register_no}
                        </h5>
                        <Row>
                          <Col sm="12" md="8">
                            <h5 className="py-2">
                              <b>Email</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <a href={`mailto:${nf.email}`}>{nf.email}</a>
                            </h5>
                          </Col>
                          <Col sm="12" md="4">
                            <h5 className="py-2">
                              <b>Phone</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {nf.mobile_phone}
                            </h5>
                          </Col>
                        </Row>
                        <h5 className="py-2">
                          <b>Address</b>
                          :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {(nf.addressline1 && nf.addressline1 != '' && nf.addressline1 != '-') ? `${nf.addressline1}, ` : '' }
                          {(nf.addressline2 && nf.addressline2 != '' && nf.addressline2 != '-') ? `${nf.addressline2}, ` : '' }
                          {(nf.city && nf.city != '' && nf.city != '-') ? `${nf.city}, ` : '' }
                          {(nf.state && nf.state != '' && nf.state != '-') ? `${nf.state}, ` : '' }
                          {nf.zip_code}
                        </h5>
                      </Col>
                    </Row>
                  </Segment>
                </Col>
                <Col sm="4">
                  <Segment>
                    <h4 className="text-center"><b>Summary</b></h4>
                      <Row>
                        <Col sm="12">
                          <h5 className="py-2">
                            President:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {nf.president}
                          </h5>
                        </Col>
                        <Col sm="12">
                            <h5 className="py-2">
                              Clubs:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {nf.clubs}
                            </h5>
                          </Col>
                          <Col sm="12">
                            <h5 className="py-2">
                              Judokas:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {nf.players}
                              &nbsp;&nbsp;
                              (Male:&nbsp;&nbsp;
                              {nf.mplayers}
                              ,&nbsp;&nbsp;Female:&nbsp;&nbsp;
                              {nf.fplayers}
                              )
                            </h5>
                          </Col>
                      </Row>
                  </Segment>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col sm="12">
                  
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(NFProfile);
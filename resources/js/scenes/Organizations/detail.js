/* eslint-disable react/sort-comp */
import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import Select from 'react-select';
import { Segment, Image, Input } from 'semantic-ui-react';
import Api from '../../apis/app';
import Bitmaps from '../../theme/Bitmaps';
import SubTable from '../../components/SubTable';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import MainTopBar from '../../components/TopBar/MainTopBar';
import AdminBar from '../../components/AdminBar';

import { member_type_options, referee_type_options, search_genders, Dans } from '../../configs/data';

class OrganizationDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      org: {},
      filter: '',
      filterMember: '',
      type: '',
      init_data: [],
      data: [],
      init_members: [],
      members:[],
      membertype: '',
      memtype: '',
      weights: [],
      search_gender: search_genders[0],
      search_weight: '',
      search_dan: Dans[0],
      is_super: ''
    };

    if (member_type_options.length === 4) {
      member_type_options.splice(0, 0, { label: 'All', value: '' });
    }

    if (referee_type_options.length == 3) {
      referee_type_options.splice(0, 0, { label: 'All Referee', value: 'all' });
    }
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    this.setState({
      is_super: user.user.is_super
    });

    const org_id = this.props.location.state;
    const org_data = await Api.get(`organization/${org_id}`);
    switch (org_data.response.status) {
      case 200:
        this.setState({
          org: org_data.body,
          type: org_data.body.type,
          init_data: org_data.body.table,
          data: org_data.body.table,
          init_members: org_data.body.members,
          members: org_data.body.members
        });

        break;
      case 406:
        break;
      default:
        break;
    }

    const weight_list = await Api.get('weights');
    switch (weight_list.response.status) {
      case 200:
        this.setState({
          weights: weight_list.body
        });
        break;
      default:
        break;
    }
  }

  handleSelectType(data) {
    const memtype = data.value;

    let filtered = [];

    switch (memtype) {
      case 'staff':
        filtered = this.state.init_data.filter(obj => obj.role_id == 1);
        break;
      case 'coach':
        filtered = this.state.init_data.filter(obj => obj.role_id == 2);
        break;
      case 'judoka':
        filtered = this.state.init_data.filter(obj => obj.role_id == 3);
        break;
      case 'referee':
        filtered = this.state.init_data.filter(obj => obj.role_id == 4);
        break;
      default:
        filtered = this.state.init_data;
    }

    this.setState({
      data: filtered,
      memtype
    });
  }

  handleFilterItem(evt, data) {
    const { type } = this.state;

    this.setState({
      filter: data.value
    });

    let filtered = [];

    if (type == 'org') {
      filtered = this.state.init_data.filter(
        obj => obj.name_o.toUpperCase().includes(data.value.toUpperCase())
      );
    } else {
      filtered = this.state.init_data.filter(
        obj => obj.name.toUpperCase().includes(data.value.toUpperCase())
                 || obj.surname.toUpperCase().includes(data.value.toUpperCase())
      );
    }

    this.setState({
      data: filtered
    });
  }

  handleSelectMemberType(data) {
    const membertype = data.value;

    let filtered = [];

    switch (membertype) {
      case 'staff':
        filtered = this.state.init_members.filter(obj => obj.role_id == 1);
        break;
      case 'coach':
        filtered = this.state.init_members.filter(obj => obj.role_id == 2);
        break;
      case 'referee':
        filtered = this.state.init_members.filter(obj => obj.role_id == 4);
        break;
      default:
        filtered = this.state.init_members;
    }

    this.setState({
      members: filtered,
      membertype
    });
  }

  handleSelectRefereeType(data) {
    let filtered = [];

    if (data.value == 'all') {
      filtered = this.state.init_members.filter(obj => obj.role_id == 4);
    } else {
      filtered = this.state.init_members.filter(obj => obj.position == data.value);
    }

    this.setState({
      members: filtered
    });
  }

  handleFilterMember(evt, data) {
    this.setState({
      filterMember: data.value
    });

    let filtered = [];

    filtered = this.state.init_members.filter(
      obj => obj.name.toUpperCase().includes(data.value.toUpperCase())
               || obj.surname.toUpperCase().includes(data.value.toUpperCase()));

    this.setState({
      members: filtered
    });
  }

  async handleSelectItem(id) {
    const option = this.state.type;

    if (option == 'org') {
      const sub_data = await Api.get(`organization/${id}`);

      switch (sub_data.response.status) {
        case 200:
          this.setState({
            org: sub_data.body,
            type: sub_data.body.type,
            init_data: sub_data.body.table,
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

  async handleSelectMember(id) {
    this.props.history.push('/member/detail', id);
  }

  getWeights(gender) {
    return this.state.weights.filter((weight) => {
      if (`${gender}` == '0') {
        return true;
      }
      return `${weight.gender}` == `${gender}`;
    });
  }

  render() {
    const {
      org, filter, filterMember, type, data, members, memtype, membertype,
      search_gender, search_weight, search_dan,
      is_super
    } = this.state;

    return (
      <Fragment>
        {is_super == 1 ? <AdminTopBar /> : <MainTopBar />}

        <div className={is_super == 1 ? "d-flex" : ""}>
          {is_super == 1 && (
            <AdminBar />
          )}

          <div className={is_super == 1 ? "admin-dashboard pt-5" : "main-content detail"}>
            <Container>
              <Row>
                <Col md={org.is_club == 1 ? 12 : 8} className="mt-2">
                  <Segment>
                    <Row>
                      <Col sm="12" md="4" lg="3">
                        <div className="detail-image">
                          <Image className="m-auto" src={org.logo ? org.logo : Bitmaps.logo} />
                        </div>
                      </Col>
                      <Col sm="12" md="8" lg="9">
                        <h5 className="py-2">
                          <b>{ org.is_club ? 'Club Name' : 'Regional Federation Name' }</b>
                          :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {org.name_o}
                          {' '}
                          (
                          {org.name_s}
                          )&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {org.is_club ? (` (Regional Federation: ${org.parent}) `) : ''}
                        </h5>
                        <h5 className="py-2">
                          <b>Register No</b>
                          :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {org.register_no}
                        </h5>
                        <Row>
                          <Col sm="12" md="8">
                            <h5 className="py-2">
                              <b>Email</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <a href={`mailto:${org.email}`}>{org.email}</a>
                            </h5>
                          </Col>
                          <Col sm="12" md="4">
                            <h5 className="py-2">
                              <b>Phone</b>
                              :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {org.mobile_phone}
                            </h5>
                          </Col>
                        </Row>
                        <h5 className="py-2">
                          <b>Address</b>
                          :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {(org.addressline1 && org.addressline1 != '' && org.addressline1 != '-') ? `${org.addressline1}, ` : '' }
                          {(org.addressline2 && org.addressline2 != '' && org.addressline2 != '-') ? `${org.addressline2}, ` : '' }
                          {(org.city && org.city != '' && org.city != '-') ? `${org.city}, ` : '' }
                          {(org.state && org.state != '' && org.state != '-') ? `${org.state}, ` : '' }
                          {org.zip_code}
                        </h5>
                      </Col>
                    </Row>
                  </Segment>
                </Col>
                {
                  org.is_club != 1 && (
                    <Col md="4" className="mt-2">
                      <Segment>
                        <h4 className="text-center"><b>Summary</b></h4>
                        <Row>
                          <Col sm="12">
                            <h5 className="py-2">
                              President:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {org.president}
                            </h5>
                          </Col>
                          <Col sm="12">
                            <h5 className="py-2">
                              Clubs:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {org.clubs}
                            </h5>
                          </Col>
                          <Col sm="12">
                            <h5 className="py-2">
                              Judokas:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              {org.players}
                              &nbsp;&nbsp;
                              (Male:&nbsp;&nbsp;
                              {org.mplayers}
                              ,&nbsp;&nbsp;Female:&nbsp;&nbsp;
                              {org.fplayers}
                              )
                            </h5>
                          </Col>
                        </Row>
                      </Segment>
                    </Col>
                  )
                }
              </Row>
            </Container>
            {
              type == 'org' && (
                <Container>
                  <div className="mt-5">
                    <Row className="mb-2">
                      <Col sm="12">
                        <h4>Search Federation Managers</h4>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm="3">
                        <Select
                          options={member_type_options.filter(item => item.value != 'judoka')}
                          onChange={this.handleSelectMemberType.bind(this)}
                        />
                      </Col>
                      {
                        membertype === 'referee' && (
                          <Col sm="3">
                            <Select
                              options={referee_type_options}
                              onChange={this.handleSelectRefereeType.bind(this)}
                            />
                          </Col>
                        )
                      }
                      <Col sm="3">
                        <Input
                          value={filterMember}
                          icon="search"
                          placeholder="Search Members"
                          onChange={this.handleFilterMember.bind(this)}
                        />
                      </Col>
                    </Row>
                    <div className="table-responsive">
                      <SubTable
                        type="member"
                        items={members}
                        onSelect={this.handleSelectMember.bind(this)}
                      />
                    </div>
                  </div>
                </Container>
              )
            }
            <Container>
              <div className="mt-5">
                <Row className="mb-2">
                  <Col sm="12">
                    <h4>{org.is_club == 1 ? 'Search Members in this Club' : 'Search Clubs'}</h4>
                  </Col>
                </Row>
                <Row>
                  {
                    org.is_club == 1 && (
                      <Col sm="3">
                        <Select
                          options={member_type_options.filter(item => item.value != 'referee')}
                          onChange={this.handleSelectType.bind(this)}
                          />
                      </Col>
                    )
                  }
                  <Col sm="3">
                    <Input
                      value={filter}
                      icon="search"
                      placeholder={org.is_club == 1 ? 'Search Members' : 'Search Clubs'}
                      onChange={this.handleFilterItem.bind(this)}
                    />
                  </Col>
                  {
                    org.is_club == 1 && memtype == 'judoka' && (
                      <Fragment>
                        <Col sm="2">
                          <Select
                            options={search_genders}
                            value={search_gender}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(gender) => {
                              let filtered = [];

                              if (gender.value == 2 || gender.value == 1) {
                                filtered = this.state.init_data.filter(obj => obj.gender == gender.value);
                              } else {
                                filtered = this.state.init_data;
                              }

                              this.setState({
                                data: filtered,
                                search_gender: gender,
                                search_weight: ''
                              });
                            }}
                          />
                        </Col>
                        <Col sm="2">
                          <Select
                            placeholder="Weight"
                            value={search_weight}
                            options={this.getWeights(search_gender ? search_gender.value : '')}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => `${option.weight}Kg`}
                            onChange={(weight) => {
                              const filtered = this.state.init_data.filter(obj => obj.weight == weight.weight);

                              this.setState({
                                data: filtered,
                                search_weight: weight
                              });
                            }}
                          />
                        </Col>
                        <Col sm="2">
                          <Select
                            value={search_dan}
                            options={Dans}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(dan) => {
                              let filtered = [];

                              if (dan.value > 0) filtered = this.state.init_data.filter(obj => obj.dan == dan.value);
                              else filtered = this.state.init_data;

                              this.setState({
                                data: filtered,
                                search_dan: dan
                              });
                            }}
                          />
                        </Col>
                      </Fragment>
                    )
                  }
                </Row>
              </div>
              <div className="table-responsive">
                <SubTable
                  type={type}
                  items={data}
                  onSelect={this.handleSelectItem.bind(this)}
                />
              </div>
            </Container>
          </div>
        </div>

        
      </Fragment>
    );
  }
}

export default OrganizationDetail;

/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import {
  Container, Row, Col, FormGroup, Button
} from 'reactstrap';
import { Segment, Input } from 'semantic-ui-react';
import Select from 'react-select';

import Api from '../../apis/app';

import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionMemberTable from '../../components/CompetitionMemberTable';
import { member_type_options, search_genders } from '../../configs/data';

class NotificationDetail extends Component {
  constructor(props) {
    super(props);

    const user = JSON.parse(localStorage.getItem('auth'));

    this.state={
      org_id: user.user.member_info.organization_id,
      type: '',
      name: '',
      from: '',
      to: '',
      weights: [],
      filter_data: [],
      members: [],
      selectMembers: [],
      filter: {
        search_type: '',
        search_name: '',
        search_gender: search_genders[0],
        search_weight: ''
      }
    }

    if (member_type_options.length === 4) {
      member_type_options.splice(0, 0, { label: 'All Members', value: '' });
    }
  }

  async componentDidMount() {
    const id = this.props.location.state;
    
    const notification = await Api.get(`notification/${id}`);
    switch (notification.response.status) {
      case 200:
        this.setState({
          type: notification.body.data.notification,
          name: notification.body.data.name,
          from: notification.body.data.from,
          to: notification.body.data.to
        });
        break;
      default:
        break;
    }

    const members = await Api.get(`competitioin-members/${this.state.org_id}`);
    switch (members.response.status) {
      case 200:
        this.setState({
          filter_data: members.body.data,
          members: members.body.data
        });
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

  getWeights(gender) {
    return this.state.weights.filter((weight) => {
      if (`${gender}` == '0') {
        return true;
      }
      return `${weight.gender}` == `${gender}`;
    });
  }

  handleSearchFilter(type, value) {
    const {filter, filter_data} = this.state;
    filter[type] = value;

    if (type == 'search_gender') {
      filter['search_weight'] = '';
    }
    
    this.setState({
      filter
    });
    
    let filtered = filter_data;

    if (filter.search_type != '' && filter.search_type.value != '') {
      filtered = filtered.filter(member => member.role_name == filter.search_type.label);
    }

    if (filter.search_name != '') {
      filtered = filtered.filter(
        member => member.name.toUpperCase().includes(filter.search_name.toUpperCase()) || 
                  member.surname.toUpperCase().includes(filter.search_name.toUpperCase()))
    }

    if (filter.search_gender.value != '') {
      filtered = filtered.filter(member => member.gender == filter.search_gender.value)
    }
    
    if (filter.search_type.value == 'judoka' && filter.search_weight != '' && filter.search_weight.weight != 'All') {
      filtered = filtered.filter(member => member.weight == filter.search_weight.weight);
    }

    this.setState({
      members: filtered
    });
  }

  handleSelectMember(member, checked) {
    const { members } = this.state;
    for (let i = 0; i < members.length; i++) {
      const item = members[i];
      if (item.id === member) {
        item.checked = checked;
      }
    }

    this.setState({
      members,
      selectMembers: members.filter(item => item.checked === true)
    });
  }

  handleSelectAll(data, event) {
    const { members } = this.state;
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      for (let j = 0; j < data.length; j++) {
        const item = data[j];
        if (item.id === member.id) {
          member.checked = event.target.checked;
        }
      }
    }
    
    this.setState({
      members,
      selectMembers: members.filter(item => item.checked === true)
    });
  }

  async handleAttend() {
    const { selectMembers } = this.state;
    
    if (selectMembers && selectMembers.length > 0) {
      const params = {};

      params.notification = this.props.location.state;
      params.club_id = this.state.org_id;
      params.members = selectMembers.map(item => item.id);
    
      const data = await Api.post('attend-members', params);
      switch (data.response.status) {
        case 200:
          
          break;
        default:
          break;
      }
    } else {
      window.alert('You should select at least one member!');
    }
  }

  render() {
    const { 
      type, name, from, to,
      members,
      filter
    } = this.state;
    
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container>
            <Row>
              <Col sm="12">
                <Segment>
                  <Row>
                    <Col sm="4"><h5 className="py-2 text-right"><b>Notification Type: </b></h5></Col>
                    <Col sm="8"><h5 className="py-2">{type}</h5></Col>
                  </Row>
                  <Row>
                    <Col sm="4"><h5 className="py-2 text-right"><b>Competition Name: </b></h5></Col>
                    <Col sm="8"><h5 className="py-2">{name}</h5></Col>
                  </Row>
                  <Row>
                    <Col sm="4"><h5 className="py-2 text-right"><b>From: </b></h5></Col>
                    <Col sm="8"><h5 className="py-2">{from}</h5></Col>
                  </Row>
                  <Row>
                    <Col sm="4"><h5 className="py-2 text-right"><b>To: </b></h5></Col>
                    <Col sm="8"><h5 className="py-2">{to}</h5></Col>
                  </Row>
                </Segment>
              </Col>
            </Row>
          </Container>
          <Container fluid>
            <Row className="mt-5">
              <Col lg="2" md="3" sm="4">
                <FormGroup>
                  <Select
                    name="search_type"
                    classNamePrefix={'react-select-lg'}
                    placeholder="Member Type"
                    value={filter.search_type}
                    options={member_type_options}
                    getOptionValue={option => option.value}
                    getOptionLabel={option => option.label}
                    onChange={(type) => {
                      this.handleSearchFilter('search_type', type);
                    }}
                  />
                </FormGroup>
              </Col>
              <Col lg="2" md="3" sm="4">
                <FormGroup>
                  <Input
                    name="search_name"
                    placeholder="Name"
                    value={filter.search_name}
                    onChange={(event) => {
                      this.handleSearchFilter('search_name', event.target.value);
                    }}
                  />
                </FormGroup>
              </Col>
              <Col lg="2" md="3" sm="4">
                <FormGroup>
                  <Select
                    name="search_gender"
                    classNamePrefix="react-select-lg"
                    placeholder="All Gender"
                    value={filter.search_gender}
                    options={search_genders}
                    getOptionValue={option => option.value}
                    getOptionLabel={option => option.label}
                    onChange={(gender) => {
                      this.handleSearchFilter('search_gender', gender);
                    }}
                  />
                </FormGroup>
              </Col>
              {
                filter.search_type && filter.search_type.value === 'judoka' && (
                  <Col lg="2" md="3" sm="4">
                    <FormGroup>
                      <Select
                        name="search_weight"
                        classNamePrefix="react-select-lg"
                        placeholder="Weight"
                        value={filter.search_weight}
                        options={this.getWeights(filter.search_gender ? filter.search_gender.value : '')}
                        getOptionValue={option => option.id}
                        getOptionLabel={option => `${option.weight} Kg`}
                        onChange={(weight) => {
                          this.handleSearchFilter('search_weight', weight);
                        }}
                      />
                    </FormGroup>
                  </Col>
                )
              }
              {
                members && members.length > 0 && (
                  <Col lg="2" md="3" sm="4">
                    <FormGroup>
                      <Button
                        type="button"
                        color="success"
                        onClick={this.handleAttend.bind(this)}
                      >
                        Attend Members
                      </Button>
                    </FormGroup>
                  </Col>
                )
              }
            </Row>
            <Row className="mt-2">
              <Col sm="12">
                {
                  members && members.length > 0 && (
                    <CompetitionMemberTable
                      items={members}
                      onSelect={this.handleSelectMember.bind(this)}
                      onSelectAll={this.handleSelectAll.bind(this)}
                    />
                  )
                }
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    )
  }
}

export default withRouter(NotificationDetail);
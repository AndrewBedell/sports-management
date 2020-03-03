import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import {
  withRouter
} from 'react-router-dom';
import { Input } from 'semantic-ui-react';
import Select from 'react-select';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import InviteTable from '../../components/InviteTable';
import ChangeSuperTable from '../../components/ChangeSuperTable';

import { OrganizationType } from '../../configs/data';

class GetInviteUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      members: [],
      init_members: [],
      temp_members: [],
      filter_members: '',
      users: [],
      init_users: [],
      temp_users: [],
      filter_users: ''
    }

    OrganizationType.splice(0, 0, {label: "All", value: ""});
  }

  async componentDidMount() {
    const data = await Api.get('invite-users');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          init_members: body.members,
          members: body.members,
          init_users: body.users,
          users: body.users
        });
        break;
      case 406:
        break;
      default:
        break;
    }
  }

  handleSelectInvite(data) {
    let value = data.value;

    var filtered = [];

    switch (value) {
      case "nf":
        filtered = this.state.init_members.filter((obj) => obj.parent_id == 0);

        break;
      case "ref":
        filtered = this.state.init_members.filter((obj) => obj.parent_id == 1);

        break;
      case "club":
        filtered = this.state.init_members.filter((obj) => obj.is_club == 1);

        break;
      default:
        filtered = this.state.init_members;

        break;
    }

    this.setState({
      members: filtered,
      temp_members: filtered,
      filter_members: ''
    });
  }

  handleFilterInvite(evt, data) {
    this.setState({
      filter_members: data.value
    });

    var filtered = [];

    if (this.state.temp_members.length == 0) {
      this.setState({
        temp_members: this.state.init_members
      });
    }

    filtered = this.state.temp_members.filter(
      (obj) => obj.name.toUpperCase().includes(data.value.toUpperCase()) || 
               obj.surname.toUpperCase().includes(data.value.toUpperCase())
    );

    this.setState({
      members: filtered
    });
  }

  handleSelectChange(data) {
    let value = data.value;

    var filtered = [];

    switch (value) {
      case "nf":
        filtered = this.state.init_users.filter((obj) => obj.parent_id == 0);

        break;
      case "ref":
        filtered = this.state.init_users.filter((obj) => obj.parent_id == 1);

        break;
      case "club":
        filtered = this.state.init_users.filter((obj) => obj.is_club == 1);

        break;
      default:
        filtered = this.state.init_users;

        break;
    }

    this.setState({
      users: filtered,
      temp_users: filtered,
      filter_users: ''
    });
  }

  handleFilterChange(evt, data) {
    this.setState({
      filter_users: data.value
    });

    var filtered = [];

    if (this.state.temp_users.length == 0) {
      this.setState({
        temp_users: this.state.init_users
      });
    }

    filtered = this.state.temp_users.filter(
      (obj) => obj.name.toUpperCase().includes(data.value.toUpperCase()) || 
               obj.surname.toUpperCase().includes(data.value.toUpperCase())
    );

    this.setState({
      users: filtered,
    });
  }

  render() {
    const {
      members,
      users,
      filter_members,
      filter_users
    } = this.state;
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container fluid>
            <Row className="my-2">
              <Col sm="3">
                <Select
                  sm="4"
                  options={OrganizationType}
                  onChange={this.handleSelectInvite.bind(this)}
                />
              </Col>
              <Col sm="3">
                <Input
                  value={filter_members}
                  icon='search'
                  placeholder='Search Invite Users'
                  onChange={this.handleFilterInvite.bind(this)}
                />
              </Col>
            </Row>
            <div className="table-responsive">
              <InviteTable
                items={members}
              />
            </div>

            <Row className="mt-5 mb-2">
              <Col sm="3">
                <Select
                  sm="4"
                  options={OrganizationType}
                  onChange={this.handleSelectChange.bind(this)}
                />
              </Col>
              <Col sm="3">
                <Input
                  value={filter_users}
                  icon='search'
                  placeholder='Search Users'
                  onChange={this.handleFilterChange.bind(this)}
                />
              </Col>
            </Row>
            <div className="table-responsive">
              <ChangeSuperTable
                items={users}
              />
            </div>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(GetInviteUsers);
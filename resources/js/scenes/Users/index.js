import React, { Component, Fragment } from 'react';
import {
  Container
} from 'reactstrap';
import {
  withRouter
} from 'react-router-dom';
import { Input } from 'semantic-ui-react'

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import InviteTable from '../../components/InviteTable';
import ChangeSuperTable from '../../components/ChangeSuperTable';

class GetInviteUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      init_members: [],
      filter_members: '',
      users: [],
      init_users: [],
      filter_users: ''
    }
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

  handleFilterInvite(evt, data) {
    this.setState({
      filter_members: data.value
    });

    var filtered = [];

    filtered = this.state.init_members.filter(
      (obj) => obj.name.toUpperCase().includes(data.value.toUpperCase()) || 
               obj.surname.toUpperCase().includes(data.value.toUpperCase())
    );

    this.setState({
      members: filtered
    });
  }

  handleFilterChange(evt, data) {
    this.setState({
      filter_users: data.value
    });

    var filtered = [];

    filtered = this.state.init_users.filter(
      (obj) => obj.name.toUpperCase().includes(data.value.toUpperCase()) || 
               obj.surname.toUpperCase().includes(data.value.toUpperCase())
    );

    this.setState({
      users: filtered
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
            <div className="my-2">
              <Input
                value={filter_members}
                icon='search'
                placeholder='Search Invite Users'
                onChange={this.handleFilterInvite.bind(this)}
              />
            </div>
            <div className="table-responsive">
              <InviteTable
                items={members}
              />
            </div>
            <div className="mt-5 mb-2">
              <Input
                value={filter_users}
                icon='search'
                placeholder='Search Users'
                onChange={this.handleFilterChange.bind(this)}
              />
            </div>
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
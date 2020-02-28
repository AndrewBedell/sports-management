import React, { Component, Fragment } from 'react';
import {
  Container
} from 'reactstrap';
import {
  withRouter
} from 'react-router-dom';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import InviteTable from '../../components/InviteTable';
import ChangeSuperTable from '../../components/ChangeSuperTable';

class GetInviteUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      users: []
    }
  }

  async componentDidMount() {
    const data = await Api.get('invite-users');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          members: body.members,
          users: body.users
        });
        break;
      case 406:
        break;
      default:
        break;
    }
  }

  render() {
    const {
      members,
      users
    } = this.state;
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container fluid>
            <div className="table-responsive">
              <InviteTable
                items={members}
              />
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
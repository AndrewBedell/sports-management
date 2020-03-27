/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import { Container } from 'reactstrap';

import Api from '../../apis/app';

import MainTopBar from '../../components/TopBar/MainTopBar';
import NotificationTable from '../../components/NotificationTable';

class Notifications extends Component {
  constructor(props) {
    super(props);

    this.state={
      notifications: []
    }
  }

  async componentDidMount() {
    const notifications = await Api.get('notifications');
    const { response, body } = notifications;
    switch (response.status) {
      case 200:
        this.setState({
          notifications: body.data
        });
        break;
      default:
        break;
    }
  }

  handleSelectItem(id) {
    this.props.history.push('/notification/read', id);
  }

  render() {
    const { notifications } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container>
            {
              notifications && notifications.length == 0 && (
                <div className="fixed-content">
                  <h3 className="text-muted">
                    No notifications!
                  </h3>
                </div>
              )
            }
            {
              notifications && notifications.length > 0 && (
                <NotificationTable
                  items={notifications}
                  onSelect={this.handleSelectItem.bind(this)}
                />
              )
            }
          </Container>
        </div>
      </Fragment>
    )
  }
}

export default withRouter(Notifications);
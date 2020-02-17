import React, {
  Component, Fragment
} from 'react';
import {
  Container
} from 'reactstrap';

import MainTopBar from '../../components/TopBar/MainTopBar';

class Dashboard extends Component {

  render() {
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container>
            <h3 className="text-danger">Welcome to Sports management system!</h3>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default Dashboard;

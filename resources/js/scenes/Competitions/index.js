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
  Container,
  Button
} from 'reactstrap';

import MainTopBar from '../../components/TopBar/MainTopBar';

class Competitions extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  handleCreateCompetition() {
    this.props.history.push('/competition/create');
  }

  render() {
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container fluid>
            <div className="text-center mb-4">
              <Button
                type="button"
                color="success"
                onClick={this.handleCreateCompetition.bind(this)}
              >
                Create Competition
              </Button>
            </div>
          </Container>
        </div>
      </Fragment>
    )
  }
}

export default withRouter(Competitions);
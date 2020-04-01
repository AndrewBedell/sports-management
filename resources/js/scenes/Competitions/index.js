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
  Container, Row, Col
} from 'reactstrap';

import Api from '../../apis/app';

import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionTable from '../../components/CompetitionTable';

class Competitions extends Component {
  constructor(props) {
    super(props);

    this.state={
      is_nf: 0,
      competitions: []
    };
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const is_nf = user.user.is_nf;

    this.setState({
      is_nf
    });

    if (is_nf == 1) {
      const competitions = await Api.get('competitions');
      const { response, body } = competitions;
      switch (response.status) {
        case 200:
          this.setState({
            competitions: body.competitions
          });
          break;
        default:
          break;
      }
    } else {
      const competitions = await Api.get('find-competitions');
      const { response, body } = competitions;
      switch (response.status) {
        case 200:
          this.setState({
            competitions: body.competitions
          });
          break;
        default:
          break;
      }
    }
  }

  handleSelectItem(id, target) {
    this.props.history.push('/competition/' + target, id);
  }

  render() {
    const { competitions } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container>
            <Row>
              <Col sm="12">
                {
                  competitions && competitions.length > 0 && (
                    <CompetitionTable
                      items={competitions}
                      onSelect={this.handleSelectItem.bind(this)}
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

export default withRouter(Competitions);
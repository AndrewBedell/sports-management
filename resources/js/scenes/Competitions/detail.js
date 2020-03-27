import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import { Segment } from 'semantic-ui-react';
import Api from '../../apis/app';
import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionClubTable from '../../components/CompetitionClubTable';
import CompetitionSelectTable from '../../components/CompetitionSelectTable';

class CompetitionDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      competition_id: '',
      competition: [],
      clubs: [],
      selectMembers: [],
      detail: false
    };
  }

  async componentDidMount() {
    const competition_id = this.props.location.state;
    this.setState({
      competition_id
    });

    const data = await Api.get(`competition/${competition_id}`);
    switch (data.response.status) {
      case 200:
        this.setState({
          competition: data.body.competition
        });
        break;
      default:
        break;
    }

    const clubs = await Api.get(`competition-clubs/${competition_id}`);
    switch (clubs.response.status) {
      case 200:
        this.setState({
          clubs: clubs.body.result
        });
        break;
      default:
        break;
    }
  }

  async handleSelectClub(club_id, action) {
    const params = {};

    params.competition_id = this.state.competition_id;
    params.club_id = club_id;

    if (action == 'detail') {
      const selects = await Api.post('competition-members', params);
      switch (selects.response.status) {
        case 200:
          this.setState({
            selectMembers: selects.body.data,
            detail: true
          });
          break;
        default:
          break;
      }
    }

    if (action == 'accept') {
      const accept = await Api.post('accept-competition', params);
      switch (accept.response.status) {
        case 200:
          this.setState({
            clubs: accept.body.result
          });
          break;
        default:
          break;
      }
    }
  }

  render() {
    const { competition, clubs, selectMembers, detail } = this.state;

    return (
      <Fragment>
        <MainTopBar />

        <div className="main-content detail">
          <Container>
            <Segment>
              <Row>
                <Col sm="12">
                  <h3 className="text-center text-primary">{competition.name}</h3>
                </Col>
                <Col sm="12" className="mt-5">
                  <h4>Competition Place: {competition.place}</h4>
                </Col>
                <Col sm="12" className="mt-3">
                  <h4>Competition Time: {competition.from} ~ {competition.to}</h4>
                </Col>
                <Col sm="12" className="mt-3">
                  <h4>Federations and Clubs: {competition.reg_ids} Regions, {competition.club_ids} Clubs</h4>
                </Col>
              </Row>
            </Segment>
            {
              clubs && clubs.length > 0 && (
                <Row className="mt-5">
                  <CompetitionClubTable
                    items={clubs}
                    onSelect={this.handleSelectClub.bind(this)}
                  />
                </Row>
              )
            }
            {
              selectMembers && selectMembers.length > 0 && (
                <Row className="mt-3">
                  <CompetitionSelectTable
                    items={selectMembers}
                  />
                </Row>
              )
            }
            {
              detail && selectMembers && selectMembers.length == 0 && (
                <div className="fixed-content">
                  <h3 className="text-muted">
                    No results!
                  </h3>
                </div>
              )
            }
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default CompetitionDetail;
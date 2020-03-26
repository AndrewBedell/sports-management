import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col
} from 'reactstrap';
import { Segment, Image } from 'semantic-ui-react';
import Api from '../../apis/app';
import Bitmaps from '../../theme/Bitmaps';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import MainTopBar from '../../components/TopBar/MainTopBar';
import AdminBar from '../../components/AdminBar';
import { referee_type_options } from '../../configs/data';

class CompetitionDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      competition: []
    };
  }

  async componentDidMount() {
    const id = this.props.location.state;
    const data = await Api.get(`competition/${id}`);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          competition: body.competition
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { competition } = this.state;

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
                <Col sm="12" className="mt-3"><h4>Federations and Clubs: </h4></Col>
                <Col sm="12" className="mt-3 mx-5">
                  {
                    competition.reg_ids && competition.reg_ids.length > 0 && competition.reg_ids.map((reg, i) => (
                      <h5 key={i}>
                        {reg} : {competition.club_ids[i]}
                      </h5>
                    ))
                  }
                </Col>
              </Row>
            </Segment>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default CompetitionDetail;
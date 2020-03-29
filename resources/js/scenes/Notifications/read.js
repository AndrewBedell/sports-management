import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col,
  Button
} from 'reactstrap';
import { Segment } from 'semantic-ui-react';
import Api from '../../apis/app';
import MainTopBar from '../../components/TopBar/MainTopBar';

class ReadNotification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      club_member: 0,
      notification: []
    };
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const club_member = user.user.is_club_member;

    this.setState({
      club_member
    });

    const id = this.props.location.state;
    const data = await Api.get(`notification/${id}`);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          notification: body.data
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { club_member, notification } = this.state;

    return (
      <Fragment>
        <MainTopBar />

        <div className="main-content detail">
          <Container>
            <Segment>
              <Row>
                <Col sm="12" className="mt-5">
                  <h3 className="text-center text-primary">Notification</h3>
                </Col>
                <Col sm="12" className="mt-3 mx-5">
                  <h4><b>Content :</b></h4>
                  <h4>{notification.content}</h4>
                </Col>
                <Col sm="12" className="mt-3">
                  <div className="w-100 d-flex justify-content-end">
                    <Button
                      className="mr-2"
                      type="button"
                      color="warning"
                      onClick={
                        () =>
                          club_member == 1 ? this.props.history.push('/competition/attend', notification.subject_id)
                                     : this.props.history.push('/competition/detail', notification.subject_id)
                      }
                    >
                      Detail
                    </Button>
                  </div>
                </Col>
              </Row>
            </Segment>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default ReadNotification;
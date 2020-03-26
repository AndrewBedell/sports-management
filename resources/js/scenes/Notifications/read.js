import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col,
  Toast, ToastBody, ToastHeader,
  Button
} from 'reactstrap';
import { Segment } from 'semantic-ui-react';
import Api from '../../apis/app';
import MainTopBar from '../../components/TopBar/MainTopBar';

class ReadNotification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notification: [],
      nid: ''
    };
  }

  async componentDidMount() {
    const id = this.props.location.state;
    const data = await Api.get(`notification/${id}`);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          notification: body.data,
          nid: id
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { notification, nid } = this.state;

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
                <Col sm="12" className="mt-3">
                  <h3>Notification Type: {notification.notification}</h3>
                </Col>
                <Col sm="12" className="mt-3">
                  <div className="p-3 bg-info my-2 rounded">
                    <Toast>
                      <ToastHeader>
                        <h4>Competition Name: {notification.name}</h4>
                      </ToastHeader>
                      <ToastBody className="mx-5 mt-2">
                        <Row>
                          <Col sm="8">
                            <h4>Competition Place: {notification.place}</h4>
                            <h4>Competition Time: {notification.from} ~ {notification.to}</h4>
                          </Col>
                          <Col sm="4">
                            <div className="w-100 d-flex justify-content-end">
                              <div>
                              <Button
                                className="mr-2"
                                type="button"
                                color="warning"
                                onClick={() => this.props.history.push('/notification/detail', nid)}
                              >
                                Detail
                              </Button>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </ToastBody>
                    </Toast>
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
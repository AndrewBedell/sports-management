import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, Label, Input, Button, Form, FormGroup, FormFeedback
} from 'reactstrap';
import {
  withRouter
} from 'react-router-dom';
import Card from 'card-react';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import PlayerTable from '../../components/PlayerTable';

class Payment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pay_status: false,
      players: null,
      payPlayers: [],
      price: 0.00,
      per_price: 1.99,
      isSubmitting: false,
      priceData: {
        card_number: '',
        card_expiry_date: '',
        card_cvc: '',
        card_name: '',
        price: 0.00
      }
    };
  }

  async componentDidMount() {
    const user_info = JSON.parse(localStorage.getItem('auth'));
    if (user_info.user) {
      const data = await Api.get(`club-players/${user_info.user.member_info.organization_id}`);
      const { response, body } = data;
      switch (response.status) {
        case 200:
          this.setState({
            players: body
          });
          break;
        case 406:
          this.setState({
            players: []
          });
          break;
        default:
          break;
      }
    }
  }

  handleChangeCardInfo(field, event) {
    const { priceData } = this.state;
    priceData[field] = event.target.value;
    this.setState({
      priceData
    });
  }

  handleSelectAll(data, event) {
    const { players, per_price, priceData } = this.state;
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      for (let j = 0; j < data.length; j++) {
        const item = data[j];
        if (item.id === player.id) {
          player.checked = event.target.checked;
        }
      }
    }
    priceData.price = (players.filter(item => item.checked === true).length * per_price).toFixed(2);
    this.setState({
      price: players.filter(item => item.checked === true).length * per_price,
      players,
      payPlayers: players.filter(item => item.checked === true),
      priceData
    });
  }

  handleSelectPlayer(player, checked) {
    const { players, per_price, priceData } = this.state;
    for (let i = 0; i < players.length; i++) {
      const item = players[i];
      if (item.id === player) {
        item.checked = checked;
      }
    }

    priceData.price = (players.filter(item => item.checked === true).length * per_price).toFixed(2);

    this.setState({
      price: players.filter(item => item.checked === true).length * per_price,
      players,
      payPlayers: players.filter(item => item.checked === true),
      priceData
    });
  }

  handlePayNow() {
    const { payPlayers } = this.state;
    if (payPlayers && payPlayers.length > 0) {
      this.setState({
        pay_status: true
      });
    } else {
      window.alert('You should select at least one player!')
    }
  }

  handleBackTable() {
    const { players } = this.state;
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      player.checked = false;
    }
    this.setState({
      pay_status: false,
      players
    });
  }

  handlePay() {
    this.setState({
      isSubmitting: true
    });
    console.log(this.state.priceData);
  }

  handleDetailPlayer(id) {
    this.props.history.push('/member/detail', id);
  }

  render() {
    const {
      payPlayers,
      pay_status,
      players,
      price,
      priceData,
      isSubmitting
    } = this.state;
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content detail">
          {
            !pay_status ? (
              <Container fluid>
                <div className="text-center mb-4">
                  {
                    players && players.length > 0 && (
                      <Button
                        type="button"
                        color="success"
                        onClick={this.handlePayNow.bind(this)}
                      >
                        Pay Now
                      </Button>
                    )
                  }
                  {
                    (players !== null && players.length === 0) && (
                      <h3 className="text-center text-danger">
                        There is no player for pay now.
                      </h3>
                    )
                  }
                </div>
                <div className="table-responsive mb-3">
                  {
                    players && players.length > 0 && (
                      <PlayerTable
                        items={players}
                        onSelect={this.handleSelectPlayer.bind(this)}
                        onSelectAll={this.handleSelectAll.bind(this)}
                        onDetail={this.handleDetailPlayer.bind(this)}
                      />
                    )
                  }
                </div>
              </Container>
            ) : (
              <Container>
                {
                  payPlayers && payPlayers.length > 0 && (
                    <h3 className="text-center text-warning mb-5">
                      {`You are able to pay for ${payPlayers.length} ${payPlayers.length === 1 ? 'player' : 'players'} now.`}
                    </h3>
                  )
                }
                {
                  price !== 0 && (
                    <Card
                      container="card_container"
                      formInputsNames={{
                        number: 'card_number',
                        expiry: 'card_expiry_date',
                        cvc: 'card_cvc',
                        name: 'card_name'
                      }}
                      classes={{
                        valid: 'valid',
                        invalid: 'invalid'
                      }}
                      initialValues={
                        {
                          number: priceData.card_number,
                          cvc: priceData.card_cvc,
                          expiry: priceData.card_expiry_date,
                          name: priceData.card_name
                        }
                      }
                    >
                      <Row className="d-flex flex-column flex-md-row bg-info">
                        <Col md="6" className="align-self-center">
                          <div id="card_container" />
                        </Col>
                        <Col md="6" className="bg-light p-3">
                          <Form>
                            <FormGroup>
                              <Label for="price">Pay Today</Label>
                              <span className="d-block">
                                Total :
                                {' '}
                                {price ? `$${price}` : null}
                              </span>
                            </FormGroup>
                            <FormGroup>
                              <Label for="card_name">Name on card</Label>
                              <Input
                                type="text"
                                name="card_name"
                                id="card_name"
                                onChange={this.handleChangeCardInfo.bind(this, 'card_name')}
                              />
                              {isSubmitting && !priceData.card_name && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                            </FormGroup>

                            <Row>
                              <Col md="9">
                                <FormGroup>
                                  <Label for="card_number">Card number</Label>
                                  <Input
                                    type="text"
                                    name="card_number"
                                    id="card_number"
                                    onChange={this.handleChangeCardInfo.bind(this, 'card_number')}
                                  />
                                  {isSubmitting && !priceData.card_number && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                                </FormGroup>
                              </Col>
                              <Col md="3">
                                <FormGroup>
                                  <Label for="card_cvc">CVC</Label>
                                  <Input
                                    type="text"
                                    name="card_cvc"
                                    id="card_cvc"
                                    onChange={this.handleChangeCardInfo.bind(this, 'card_cvc')}
                                  />
                                  {isSubmitting && !priceData.card_cvc && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row>
                              <Col md="6">
                                <FormGroup>
                                  <Label for="card_expiry_date">Card expiry date</Label>
                                  <Input
                                    type="text"
                                    name="card_expiry_date"
                                    id="card_expiry_date"
                                    onChange={this.handleChangeCardInfo.bind(this, 'card_expiry_date')}
                                  />
                                  {isSubmitting && !priceData.card_expiry_date && <FormFeedback className="d-block">This field is required!</FormFeedback>}
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row>
                              <Col md="12">
                                <Button
                                  className="btn btn-outline-primary float-left"
                                  type="button"
                                  onClick={this.handleBackTable.bind(this)}>
                                  Back
                                </Button>
                                <Button
                                  className="float-right"
                                  type="button"
                                  color="primary"
                                  disabled={isSubmitting || !priceData.card_name || !priceData.card_number || !priceData.card_cvc || !priceData.card_expiry_date}
                                  onClick={this.handlePay.bind(this)}
                                >
                                  Next
                                </Button>
                              </Col>
                            </Row>

                          </Form>
                        </Col>
                      </Row>
                    </Card>
                  )
                }
              </Container>
            )
          }
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Payment);

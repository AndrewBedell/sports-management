import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, Label, Input, Button, Form, FormGroup
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
      priceData: {
        card_number: '',
        card_expiry_date: '',
        cvc: '',
        name: '',
        price: 0,
        per_price: 1
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
          break;
        default:
          break;
      }
    }
  }

  handleChange(field, event) {
    console.log(field, event.target.value);
  }

  handleSelectAll(players) {
    console.log(players);
  }

  handleSelectPlayer(player, index, event) {
    const { players, payPlayers } = this.state;
    if (event.target.checked === true) {
      players[index].checked = true;
      payPlayers.push(player);
    } else {
      players[index].checked = false;
      payPlayers.filter(item => item.id !== player.id);
    }
    this.setState({
      players,
      payPlayers
    });
  }

  handlePayNow() {
    const { priceData, payPlayers } = this.state;
    if (!priceData.price && payPlayers && payPlayers.length > 0) {
      this.setState({
        pay_status: true
      });
    } else {
      window.alert('You should select at least one player!')
    }
  }

  handleBackTable() {
    this.setState({
      pay_status: false,
      payPlayers: null
    });
  }

  handlePay() {
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
      priceData
    } = this.state;
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content detail">
          {
            !pay_status ? (
              <Container fluid>
                <div className="text-center mb-4">
                  <Button
                    type="button"
                    color="success"
                    onClick={this.handlePayNow.bind(this)}
                  >
                    Pay Now
                  </Button>
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
                    <h3 className="text-center text-success mb-4">
                      {`You can pay about ${payPlayers.length} players now.`}
                    </h3>
                  )
                }
                {
                  priceData.price !== 0 && (
                    <Card
                      container="card_container"
                      formInputsNames={{
                        number: 'card_number',
                        expiry: 'card_expiry_date',
                        cvc: 'card_cvv',
                        name: 'card_name'
                      }}
                      classes={{
                        valid: 'valid',
                        invalid: 'invalid'
                      }}
                      initialValues={
                        {
                          number: priceData.card_number,
                          cvc: priceData.card_cvv,
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
                              <span className="d-block">{priceData ? `$${priceData.price}` : null}</span>
                            </FormGroup>
                            <FormGroup>
                              <Label for="card_name">Name on card</Label>
                              <Input
                                type="text"
                                name="card_name"
                                id="card_name"
                                onChange={this.handleChange.bind(this, 'card_name')}
                              />
                            </FormGroup>

                            <Row>
                              <Col md="9">
                                <FormGroup>
                                  <Label for="card_number">Card number</Label>
                                  <Input
                                    type="text"
                                    name="card_number"
                                    id="card_number"
                                    onChange={this.handleChange.bind(this, 'card_number')}
                                  />
                                </FormGroup>
                              </Col>
                              <Col md="3">
                                <FormGroup>
                                  <Label for="card_cvv">CVV</Label>
                                  <Input
                                    type="text"
                                    name="card_cvv"
                                    id="card_cvv"
                                    onChange={this.handleChange.bind(this, 'card_cvv')}
                                  />
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
                                    onChange={this.handleChange.bind(this, 'card_expiry_date')}
                                  />
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

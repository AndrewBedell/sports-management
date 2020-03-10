/* eslint-disable no-unused-expressions */
/* eslint-disable react/sort-comp */
import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, Label, Input, Button, Form, FormGroup, FormFeedback,
  TabContent, TabPane, Nav, NavItem, NavLink
} from 'reactstrap';
import classnames from 'classnames';
import {
  withRouter
} from 'react-router-dom';
import Select from 'react-select';
import Card from 'card-react';
import { Image } from 'semantic-ui-react';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import PlayerTable from '../../components/PlayerTable';
import { Dans, search_genders } from '../../configs/data';
import Bitmaps from '../../theme/Bitmaps';

class Payment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pay_status: false,
      players: null,
      player_list: null,
      filter_data: null,
      weights: null,
      pay_method: 'directly',
      filter_players: {
        search: '',
        gender: null,
        weight: null,
        dan: null
      },
      payPlayers: [],
      price: 0.00,
      per_price: 1.99,
      isSubmitting: false,
      payme_data: null,
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
            filter_data: body,
            player_list: body,
            players: body
          });
          break;
        case 406:
          this.setState({
            filter_data: [],
            player_list: [],
            players: []
          });
          break;
        default:
          break;
      }
    }
    const weight_list = await Api.get('weights');
    switch (weight_list.response.status) {
      case 200:
        this.setState({
          weights: weight_list.body
        });
        break;
      default:
        break;
    }
  }

  handleChangeCardInfo(field, event) {
    const { priceData } = this.state;
    priceData[field] = event.target.value;
    this.setState({
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

  handlePayNow() {
    const { payPlayers } = this.state;
    if (payPlayers && payPlayers.length > 0) {
      this.setState({
        pay_status: true
      });
    } else {
      window.alert('You should select at least one player!');
    }
  }

  handleBackTable() {
    const { player_list } = this.state;
    for (let i = 0; i < player_list.length; i++) {
      const player = player_list[i];
      player.checked = false;
    }
    this.setState({
      pay_status: false,
      players: player_list,
      payPlayers: null,
      isSubmitting: false,
      payme_data: null,
      filter_players: {
        search: '',
        gender: null,
        weight: null,
        dan: null
      }
    });
  }

  handlePay() {
    this.setState({
      isSubmitting: true
    });
    console.log(this.state.priceData, this.state.payPlayers);
    this.setState({
      isSubmitting: false
    });
  }

  handlePayMe() {
    this.setState({
      isSubmitting: true
    });
    console.log(this.state.payme_data, this.state.payPlayers);
    this.setState({
      isSubmitting: false
    });
  }

  handleDetailPlayer(id) {
    this.props.history.push('/member/detail', id);
  }

  handleSearchFilter(type, value) {
    const { filter_data, filter_players } = this.state;
    let filtered = [];
    filter_players[type] = value;
    if (filter_players.weight && filter_players.weight.weight === 'All') {
      filter_players.weight = null;
    }
    if (filter_players.gender && filter_players.gender.value === 2) {
      filter_players.gender = null;
    }
    if (filter_players.dan && filter_players.dan.value === '') {
      filter_players.dan = null;
    }
    this.setState({
      filter_players
    });
    filtered = filter_data.filter(
      obj => obj.name.toUpperCase().includes(filter_players.search.toUpperCase()) || obj.surname.toUpperCase().includes(filter_players.search.toUpperCase())
    );
    if (!filter_players.search) {
      if (filter_players.gender) {
        if (filter_players.weight && filter_players.weight.weight) {
          if (filter_players.dan && filter_players.dan.value) {
            this.setState({
              players: filter_data.filter(player => player.gender == filter_players.gender.value && player.weight == filter_players.weight.weight && player.dan == filter_players.dan.value)
            });
          } else {
            this.setState({
              players: filter_data.filter(player => player.gender == filter_players.gender.value && player.weight == filter_players.weight.weight)
            });
          }
        } else if (filter_players.dan && filter_players.dan.value) {
          this.setState({
            players: filter_data.filter(player => player.gender == filter_players.gender.value && player.dan == filter_players.dan.value)
          });
        } else {
          this.setState({
            players: filter_data.filter(player => player.gender == filter_players.gender.value)
          });
        }
      } else if (filter_players.weight && filter_players.weight.weight) {
        if (filter_players.dan && filter_players.dan.value) {
          this.setState({
            players: filter_data.filter(player => player.weight == filter_players.weight.weight && player.dan == filter_players.dan.value)
          });
        } else {
          this.setState({
            players: filter_data.filter(player => player.weight == filter_players.weight.weight)
          });
        }
      } else if (filter_players.dan && filter_players.dan.value) {
        this.setState({
          players: filter_data.filter(player => player.dan == filter_players.dan.value)
        });
      } else {
        this.setState({
          players: filter_data
        });
      }
    } else if (filter_players.gender) {
      if (filter_players.weight && filter_players.weight.weight) {
        if (filter_players.dan && filter_players.dan.value) {
          this.setState({
            players: filtered.filter(player => player.gender == filter_players.gender.value && player.weight == filter_players.weight.weight && player.dan == filter_players.dan.value)
          });
        } else {
          this.setState({
            players: filtered.filter(player => player.gender == filter_players.gender.value && player.weight == filter_players.weight.weight)
          });
        }
      } else if (filter_players.dan && filter_players.dan.value) {
        this.setState({
          players: filtered.filter(player => player.gender == filter_players.gender.value && player.dan == filter_players.dan.value)
        });
      } else {
        this.setState({
          players: filtered.filter(player => player.gender == filter_players.gender.value)
        });
      }
    } else if (filter_players.weight && filter_players.weight.weight) {
      if (filter_players.dan && filter_players.dan.value) {
        this.setState({
          players: filtered.filter(player => player.weight == filter_players.weight.weight && player.dan == filter_players.dan.value)
        });
      } else {
        this.setState({
          players: filtered.filter(player => player.weight == filter_players.weight.weight)
        });
      }
    } else if (filter_players.dan && filter_players.dan.value) {
      this.setState({
        players: filtered.filter(player => player.dan == filter_players.dan.value)
      });
    } else {
      this.setState({
        players: filtered
      });
    }
  }

  getWeights(gender) {
    const { weights } = this.state;
    return weights.filter((weight) => {
      if (`${gender}` == '2') {
        return true;
      }
      return `${weight.gender}` == `${gender}`;
    });
  }

  render() {
    const {
      weights,
      payPlayers,
      pay_status,
      players,
      filter_players,
      price,
      priceData,
      payme_data,
      isSubmitting,
      pay_method
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
                <Row>
                  <Col lg="2" md="3" sm="4">
                    <FormGroup>
                      <Input
                        value={(filter_players && filter_players.search) || ''}
                        placeholder="Search Name"
                        onChange={(event) => { this.handleSearchFilter('search', event.target.value); }}
                      />
                    </FormGroup>
                  </Col>
                  <Col lg="2" md="3" sm="4">
                    <FormGroup>
                      <Select
                        name="search_gender"
                        classNamePrefix="react-select-lg"
                        placeholder="All Gender"
                        value={filter_players && filter_players.gender}
                        options={search_genders}
                        getOptionValue={option => option.value}
                        getOptionLabel={option => option.label}
                        onChange={(gender) => {
                          this.handleSearchFilter('gender', gender);
                        }}
                      />
                    </FormGroup>
                  </Col>
                  {
                    weights && weights.length > 0 && (
                      <Col lg="2" md="3" sm="4">
                        <FormGroup>
                          <Select
                            name="search_weight"
                            classNamePrefix="react-select-lg"
                            placeholder="All Weight"
                            value={filter_players && filter_players.weight}
                            options={filter_players.gender ? (this.getWeights(filter_players.gender ? filter_players.gender.value : '')) : weights}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => `${option.weight} Kg`}
                            onChange={(weight) => {
                              this.handleSearchFilter('weight', weight);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )
                  }
                  <Col lg="2" md="3" sm="4">
                    <FormGroup>
                      <Select
                        name="search_dan"
                        classNamePrefix="react-select-lg"
                        placeholder="All Dan"
                        value={filter_players && filter_players.dan}
                        options={Dans}
                        getOptionValue={option => option.value}
                        getOptionLabel={option => option.label}
                        onChange={(dan) => {
                          this.handleSearchFilter('dan', dan);
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <div className="table-responsive mb-3">
                  {
                    players !== null && (
                      <PlayerTable
                        items={players}
                        filter={filter_players}
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
                    <div>
                      <Nav tabs>
                        <NavItem>
                          <NavLink
                            className={classnames({ active: pay_method === 'directly' })}
                            onClick={() => { this.setState({ pay_method: 'directly' }); }}
                          >
                            <div className="payments">
                              <Image src={Bitmaps.visa} />
                              <Image src={Bitmaps.mastercard} />
                              <Image src={Bitmaps.amex} />
                              <Image src={Bitmaps.discover} />
                              <Image src={Bitmaps.jcb} />
                            </div>
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames({ active: pay_method === 'payme' })}
                            onClick={() => { this.setState({ pay_method: 'payme' }); }}
                          >
                            <div className="payment">
                              <Image src={Bitmaps.payme} />
                            </div>
                          </NavLink>
                        </NavItem>
                      </Nav>
                      <TabContent activeTab={pay_method}>
                        <TabPane tabId="directly">
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
                        </TabPane>
                        <TabPane tabId="payme">
                          <Row className="d-flex flex-column flex-md-row bg-info">
                            <Col md="6" className="bg-light p-3">
                              <FormGroup>
                                <Label for="price">Pay Today</Label>
                                <span className="d-block">
                                  Total :
                                  {' '}
                                  {price ? `$${price}` : null}
                                </span>
                                <div>
                                  {payme_data && payme_data.email}
                                </div>
                              </FormGroup>
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
                                    disabled={isSubmitting}
                                    onClick={this.handlePayMe.bind(this)}
                                  >
                                    Next
                                  </Button>
                                </Col>
                              </Row>
                            </Col>
                            <Col md="6" className="d-flex justify-content-center align-items-center">
                              <Image src={Bitmaps.paymeLogo} />
                            </Col>
                          </Row>
                        </TabPane>
                      </TabContent>
                    </div>
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

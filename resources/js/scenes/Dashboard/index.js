/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  bindActionCreators
} from 'redux';
import {
  connect
} from 'react-redux';
import {
  withRouter
} from 'react-router-dom';
import {
  Container, Row, Col,
  Card, CardTitle, CardText,
  Input, UncontrolledTooltip
} from 'reactstrap';
import Switch from "react-switch";

import Api from '../../apis/app';

import TopBar from '../../components/TopBar/TopBar';
import { logout } from '../../actions/common';
import Bitmaps from '../../theme/Bitmaps';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      checked: true,
      notification: [],
      org_name: ''
    };

    this.handleChangeLang = this.handleChangeLang.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));

    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let weeks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    let d = new Date();

    const month = months[d.getMonth()];
    const week = weeks[d.getDay()];
    const day = d.getUTCDate();
    
    this.setState({
      logo: user.user.logo,
      org_name: user.user.org_name,
      month,
      week,
      day
    });

    const unread = await Api.get('notification/unread');
    const { response, body } = unread;
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

  handleChangeLang(checked) {
    this.setState({ checked });
  }

  handleURL(url) {
    this.props.history.push(url);
  }

  async handleLogout() {
    await this.props.logout();
    this.props.history.push('/logout');
  }

  render() {
    const { 
      notification, logo, org_name,
      month, week, day
    } = this.state;

    return (
      <Fragment>
        <TopBar />
        <div className="tile-content dashboard">
          <Container>
            <marquee>
              {
                logo != '' && (
                  <img src={logo} className="table-avatar mr-2" />
                )
              }
              
              {org_name}
            </marquee>
            <Row className="top-bar">
              <Col sm="4" xs="12"></Col>
              <Col sm="4" xs="12" className="px-4 d-flex align-items-center">
                <span className="fa fa-search"></span>
                <Input className="search" />
              </Col>
              <Col sm="4" xs="12" className="px-4 d-flex align-items-center justify-content-end">
                <Switch
                  className="react-switch lang mx-2"
                  checked={this.state.checked}
                  height={35}
                  width={70}
                  onColor="#fff"
                  offColor="#fff"
                  onHandleColor="#08f"
                  offHandleColor="#f80"
                  onChange={this.handleChangeLang}
                  checkedIcon={
                    <div className="text d-flex justify-content-center align-items-center text-primary px-2">
                      En
                    </div>
                  }
                  uncheckedIcon={
                    <div className="text d-flex justify-content-center align-items-center text-danger px-2">
                      Ru
                    </div>
                  }
                />
                <div className="logout-button" onClick={this.handleLogout}>
                  <img src={Bitmaps.logout} alt="Logout" />
                </div>
              </Col>
            </Row>
            <Row className="mt-2 tiles">
              <Col md="3" sm="6" xs="12">
                <h3 className="ml-3">
                  <i className="fa fa-pencil mr-2"></i>
                  General
                </h3>

                <div className="two-column">
                  <Card body inverse
                    onClick={this.handleURL.bind(this, '/competition/create')}
                    style={{ backgroundColor: '#7e6c92', borderColor: '#7e6c92' }}
                  >
                    <CardTitle>
                      <i className="fa fa-building"></i>
                    </CardTitle>
                    <CardText>Organization Registration</CardText>
                  </Card>
                  <Card body inverse
                    onClick={this.handleURL.bind(this, '/member/register')}
                    style={{ backgroundColor: '#499797', borderColor: '#499797' }}
                  >
                    <CardTitle>
                      <i className="fa fa-user-plus"></i>
                    </CardTitle>
                    <CardText>Member Registration</CardText>
                  </Card>
                </div>
                <Card body inverse
                  onClick={this.handleURL.bind(this, '/search')}
                  style={{ backgroundColor: '#a239ca', borderColor: '#a239ca' }}
                >
                  <CardTitle>
                    <i className="fa fa-search"></i>
                  </CardTitle>
                  <CardText>Browse</CardText>
                </Card>
                <Card body inverse
                  onClick={this.handleURL.bind(this, '/invite-users')}
                  style={{ backgroundColor: '#262228', borderColor: '#262228' }}>
                  <CardTitle>
                    <i className="fa fa-address-card"></i>
                  </CardTitle>
                  <CardText>Admin Membership</CardText>
                </Card>
              </Col>
              <Col md="3" sm="6" xs="12">
                <h3 className="ml-3">
                  <i className="fa fa-users mr-2"></i>
                  Competition
                </h3>

                <Card body inverse
                  onClick={this.handleURL.bind(this, '/competition/create')}
                  style={{ backgroundColor: '#ffce33', borderColor: '#ffce33' }}
                >
                  <CardTitle>
                    <i className="fa fa-users"></i>
                  </CardTitle>
                  <CardText>Create Competition</CardText>
                </Card>
                <div className="two-column">
                  <Card body inverse
                    onClick={this.handleURL.bind(this, '/competitions')}
                    style={{ backgroundColor: '#90c0cc', borderColor: '#90c0cc' }}
                  >
                    <CardTitle>
                      <i className="fa fa-list"></i>
                    </CardTitle>
                    <CardText>Competition List</CardText>
                  </Card>
                  <Card body inverse style={{ backgroundColor: '#4480b2', borderColor: '#4480b2' }}>
                    <CardTitle>
                      <i className="fa fa-user"></i>
                    </CardTitle>
                    <CardText>Inscribe Competition</CardText>
                  </Card>
                </div>
                <Card body inverse id="calendar" style={{ backgroundColor: '#ec576b', borderColor: '#ec576b' }}>
                  <CardTitle>
                    <span className="month">{month}</span>
                    <span className="day">{day}</span>
                    <span className="week">{week}</span>
                    <i className="fa fa-calendar"></i>
                  </CardTitle>
                  <UncontrolledTooltip placement="right" target="calendar">
                    Click to view all competition's calendar
                  </UncontrolledTooltip>
                </Card>
              </Col>
              <Col md="3" sm="6" xs="12">
                <h3 className="ml-3">
                  <i className="fa fa-credit-card mr-2"></i>
                  Financial
                </h3>

                <Card body inverse
                  onClick={this.handleURL.bind(this, '/payment-player')}
                  style={{ backgroundColor: '#cda34f', borderColor: '#cda34f' }}
                >
                  <CardTitle>
                    <i className="fa fa-credit-card"></i>
                  </CardTitle>
                  <CardText>Judoka Payment</CardText>
                </Card>
              </Col>
              <Col md="3" sm="6" xs="12">
                <h3 className="ml-3">
                  <i className="fa fa-cogs mr-2"></i>
                  Others
                </h3>
                
                <Card body inverse
                  onClick={this.handleURL.bind(this, '/profile')}
                  style={{ backgroundColor: '#007849', borderColor: '#007849' }}
                >
                  <CardTitle>
                    <i className="fa fa-eye"></i>
                  </CardTitle>
                  <CardText>Profile</CardText>
                </Card>
                <Card body inverse
                  onClick={this.handleURL.bind(this, '/reset')}
                  style={{ backgroundColor: '#a9173e', borderColor: '#a9173e' }}
                >
                  <CardTitle>
                    <i className="fa fa-key"></i>
                  </CardTitle>
                  <CardText>Change password</CardText>
                </Card>
                <div className="two-column">
                  <Card body inverse
                    onClick={this.handleURL.bind(this, '/notifications')}
                    style={{ backgroundColor: '#696969', borderColor: '#696969' }}
                  >
                    <CardTitle>
                      {
                        notification.length > 0 && (
                          <span className="count">{notification.length}</span>
                        )
                      }
                      <i className="fa fa-bell"></i>
                    </CardTitle>
                    <CardText>Notification</CardText>
                  </Card>
                  <Card body inverse
                    onClick={this.handleURL.bind(this, '/setting')}
                    style={{ backgroundColor: '#f7882f', borderColor: '#f7882f' }}
                  >
                    <CardTitle>
                      <i className="fa fa-sliders-h"></i>
                    </CardTitle>
                    <CardText>Financial Setting</CardText>
                  </Card>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    )
  }
}

const mapStateToProps = () => ({
});
const mapDispatchToProps = dispatch => ({
  logout: bindActionCreators(logout, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
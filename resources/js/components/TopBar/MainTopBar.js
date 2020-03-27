import React, {
  Component
} from 'react';
import {
  NavLink as Link
} from 'react-router-dom';
import {
  Nav, Navbar, NavItem, NavLink, NavbarBrand, NavbarToggler, Collapse
} from 'reactstrap';
import Bitmaps from '../../theme/Bitmaps';
import RightNavBar from './RightNavBar';

class MainTopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_nf: false,
      user_is_club: false,
      isOpen: false
    };
    this.toggleOpen = this.toggleOpen.bind(this);
    this.logout = this.logout.bind(this);
    this.toggleClose = this.toggleClose.bind(this);
  }

  componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const is_nf = user.user.is_nf == 1 && true;
    const user_is_club = user.user.is_club_member == 1 && true;

    this.setState({
      is_nf,
      user_is_club
    });
  }

  logout() {
    localStorage.clear();
  }

  toggleClose() {
    this.setState({
      isOpen: false
    });
  }

  toggleOpen() {
    const { isOpen } = this.state;
    this.setState({
      isOpen: !isOpen
    });
  }

  render() {
    const { is_nf, user_is_club, isOpen } = this.state;
    return (
      <Nav className="top-header dashboard-top-bar">
        <NavbarBrand className="nav-logo" tag={Link} to="/" onClick={this.toggleClose}>
          <img src={Bitmaps.logo} alt="Sports logo" />
        </NavbarBrand>
        <NavbarToggler onClick={this.toggleOpen} className={isOpen ? 'toggle-opened' : ''} />
        <Collapse isOpen={isOpen} navbar>
          <Nav>
            <Navbar className="left-nav-bar">
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/" exact>
                  <i className="fa fa-home" />
                  Dashboard
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/competitions" exact>
                  <i className="fa fa-users" />
                  Competitions
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/invite-users" exact>
                  <i className="fa fa-user" />
                  Invite Admin
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toogleClose}>
                <NavLink tag={Link} to="/payment-player" exact>
                  <i className="fa fa-credit-card" />
                  Payment
                </NavLink>
              </NavItem>
              {/* <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/organizations">
                  <i className="fa fa-users" />
                  Organizations
                  <div />
                </NavLink>
              </NavItem>
              <NavItem onClick={this.toggleClose}>
                <NavLink tag={Link} to="/members">
                  <i className="fa fa-user" />
                  Members
                  <div />
                </NavLink>
              </NavItem> */}
            </Navbar>
            <RightNavBar />
          </Nav>
        </Collapse>
      </Nav>
    );
  }
}

export default MainTopBar;

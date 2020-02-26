/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component, Fragment } from 'react';
import {
  Table,
  Pagination,
  Menu,
  Flag,
  Button
} from 'semantic-ui-react';
import Select from 'react-select';
import ReactTooltip from 'react-tooltip';

import _ from 'lodash';
import { countries, Genders } from '../configs/data';
import Bitmaps from '../theme/Bitmaps';
import InviteModal from './InviteModal';

import Api from '../apis/app';

const flagRenderer = item => <Flag name={item.countryCode} />;

class InviteTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      column: null,
      data: [],
      direction: null,
      isOpenInviteModal: false,
      invite_item: '',
      invite_email: '',
      invite_is_super: false,
      activePage: 1,
      per_page: 10,
      current_perPage: { label: 10, value: 10 },
      pageOptions: [
        { label: 10, value: 10 },
        { label: 20, value: 20 }
      ]
    };
    this.getCountryCode = this.getCountryCode.bind(this);
    this.handleChangePerPage = this.handleChangePerPage.bind(this);
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    const user_info = JSON.parse(localStorage.getItem('auth'));
    if (user_info.user) {
      this.setState({
        user: user_info.user.member_info
      });
    }
    if (props.items.length > 0) {
      this.setState({
        activePage: 1
      });
    }
    const { items } = props;
    const { per_page } = this.state;
    this.setState({
      data: items.slice(0, per_page)
    });
  }

  getCountryCode(country_code) {
    const country_val = countries.filter(country => country.countryCode === country_code);
    if (country_val.length > 0) {
      return flagRenderer(country_val[0]);
    }
    return '';
  }

  handlePaginationChange(e, { activePage }) {
    const { items } = this.props;
    const { per_page } = this.state;
    if (activePage !== 1) {
      this.setState({
        activePage,
        data: items.slice(((activePage - 1) * per_page), activePage * per_page)
      });
    } else {
      this.setState({
        activePage,
        data: items.slice(0, per_page)
      });
    }
  }

  handleSort(clickedColumn) {
    const { column, data, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: _.sortBy(data, [clickedColumn]),
        direction: 'ascending'
      });

      return;
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending'
    });
  }

  async handleSendInvite(is_super) {
    const param = {
      email: this.state.invite_email,
      is_super: is_super ? 1 : 0
    }

    const {data, invite_item} = this.state;

    const inviteSend = await Api.get(`invite-send`, param);
    const { response } = inviteSend;
    switch (response.status) {
      case 200:
        data.filter(item => item.id === invite_item)[0].invited = 1;

        this.setState({
          data,
          isOpenInviteModal: false
        });
        break;
      default:
          break;
    }
  }

  handleChangePerPage(page_num) {
    const { items } = this.props;
    this.setState({
      activePage: 1,
      current_perPage: page_num,
      per_page: page_num.value,
      data: items.slice(0, page_num.value)
    });
  }

  handleInvite(id, email, is_super) {
    const { isOpenInviteModal } = this.state;
    this.setState({
      isOpenInviteModal: !isOpenInviteModal,
      invite_item: id,
      invite_email: email,
      invite_is_super: is_super
    });
  }

  render() {
    const {
      items
    } = this.props;
    const {
      column,
      direction,
      data,
      isOpenInviteModal,
      invite_item,
      invite_email,
      activePage,
      per_page,
      pageOptions,
      current_perPage
    } = this.state;

    return (
      <Fragment>
        <Table sortable celled selectable unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="text-center"
                sorted={column === 'name' ? direction : null}
                onClick={this.handleSort.bind(this, 'name')}
              >
                Name
              </Table.HeaderCell>
              <Table.HeaderCell className="text-center"
              sorted={column === 'gender' ? direction : null}
              onClick={this.handleSort.bind(this, 'gender')}
              >
                Gender
              </Table.HeaderCell>
              <Table.HeaderCell className="text-center"
              sorted={column === 'birthday' ? direction : null}
              onClick={this.handleSort.bind(this, 'birthday')}
              >
                Birthday
              </Table.HeaderCell>
              <Table.HeaderCell className="text-center"
                sorted={column === 'email' ? direction : null}
                onClick={this.handleSort.bind(this, 'email')}
              >
                Email
              </Table.HeaderCell>
              <Table.HeaderCell className="text-center"
                sorted={column === 'country' ? direction : null}
                onClick={this.handleSort.bind(this, 'country')}
              >
                Country
              </Table.HeaderCell>
              <Table.HeaderCell className="text-center"
                sorted={column === 'mobile_phone' ? direction : null}
                onClick={this.handleSort.bind(this, 'mobile_phone')}
              >
                Mobile
              </Table.HeaderCell>
              <Table.HeaderCell className="text-center"
                sorted={column === 'addressline1' ? direction : null}
                onClick={this.handleSort.bind(this, 'addressline1')}
              >
                Address
              </Table.HeaderCell>
              <Table.HeaderCell className="text-center">
                Status
              </Table.HeaderCell>
              <Table.HeaderCell className="text-center">
                Action
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              data && data.length > 0 && (
                data.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="text-center">
                      <span className="text-primary mr-2">
                        <a data-tip data-for={`happyFace_${index}`}><i className="fa fa-user fa-lg" /></a>
                        <ReactTooltip
                          id={`happyFace_${index}`}
                          type="light"
                          effect="float"
                          place="right"
                          className="avatar-tooltip"
                        >
                        <div className="avatar-preview"><img src={item.profile_image ? item.profile_image : Bitmaps.logo} /></div>
                        </ReactTooltip>
                      </span>
                      {item.first_name}
                      {' '}
                      {item.mid_name}
                      {' '}
                      {item.last_name}
                    </Table.Cell>
                    <Table.Cell className="text-center">{item.gender ? Genders[0].name : Genders[1].name}</Table.Cell>
                    <Table.Cell className="text-center">{item.birthday}</Table.Cell>
                    <Table.Cell className="text-center">{item.email}</Table.Cell>
                    <Table.Cell className="text-center">
                      {this.getCountryCode(item.country)}
                      {' '}
                      {countries.filter(country => country.countryCode === item.country).length > 0 && 
                       countries.filter(country => country.countryCode === item.country)[0].name}
                    </Table.Cell>
                    <Table.Cell className="text-center">{item.mobile_phone}</Table.Cell>
                    <Table.Cell>
                      {item.addressline1}
                      {item.addressline2 ? '-' : ''}
                      {item.addressline2}
                      {', '}
                      {item.city}
                      {item.state}
                      {' '}
                      {item.zip_code}
                    </Table.Cell>
                    <Table.Cell>
                      {
                        item.invited ? (
                          <div className="text-center text-success mt-2">
                            <i className="fa fa-lg fa-check" /> <span className="font-weight-bold">Invited</span>
                          </div>
                        ) : (
                          <div className="text-center"></div>
                        )
                      }
                    </Table.Cell>
                    <Table.Cell>
                      {
                        item.invited ? (
                          <div className="text-center">
                            <Button
                              type="button"
                              color="green"
                              onClick={() => this.handleInvite(item.id, item.email, item.is_super)}
                            >
                              Resend
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Button
                              type="button"
                              color="green"
                              onClick={() => this.handleInvite(item.id, item.email, item.is_super)}
                            >
                              Invite
                            </Button>
                          </div>
                        )
                      }
                    </Table.Cell>
                  </Table.Row>
                ))
              )
            }
          </Table.Body>
          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell colSpan="1">
                <Select
                  name="pageOption"
                  menuPlacement="top"
                  classNamePrefix="react-select"
                  placeholder="Per Page"
                  defaultValue={pageOptions[0]}
                  value={current_perPage}
                  options={pageOptions}
                  getOptionValue={option => option.label}
                  getOptionLabel={option => option.value}
                  onChange={(num) => {
                    this.handleChangePerPage(num);
                  }}
                />
              </Table.HeaderCell>
              <Table.HeaderCell colSpan="8">
                <Menu floated="right" pagination>
                  <Pagination
                    activePage={activePage}
                    onPageChange={this.handlePaginationChange.bind(this)}
                    totalPages={Math.ceil(items.length / per_page)}
                  />
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
        {
          isOpenInviteModal && (
          <InviteModal
            id={invite_item}
            email={invite_email}
            handleSend={this.handleSendInvite.bind(this)}
            handleCancel={this.handleInvite.bind(this)}
          />
          )
        }
      </Fragment>
    );
  }
}

InviteTable.defaultProps = {
  
};

export default InviteTable;
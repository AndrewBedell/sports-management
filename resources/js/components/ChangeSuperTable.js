/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component, Fragment } from 'react';
import { Alert } from 'reactstrap';
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

import Api from '../apis/app';

import Prompt from '../components/Prompt';

class ChangeSuperTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      column: null,
      data: [],
      direction: null,
      isOpenChangeModal: false,
      isOpenDeleteModal: false,
      confirmationMessage: '',
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
      userID: '',
      activePage: 1,
      per_page: 10,
      current_perPage: { label: 10, value: 10 },
      pageOptions: [
        { label: 10, value: 10 },
        { label: 20, value: 20 }
      ]
    };
    
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

  handleChangePerPage(page_num) {
    const { items } = this.props;
    this.setState({
      activePage: 1,
      current_perPage: page_num,
      per_page: page_num.value,
      data: items.slice(0, page_num.value)
    });
  }

  async changeSuper(id, email, is_super) {
    is_super = !is_super;

    const param = {
      email,
      is_super: is_super ? 1 : 0
    }

    const {data} = this.state;

    const changed = await Api.get(`change-super`, param);
    const { response, body } = changed;

    if (response.status == 200) {
      data.filter(item => item.user_id === id)[0].is_super = (body.data == "1");

      this.setState({data});
    }
  }

  async handleDeleteUser(id) {
    const {data} = this.state;
    
    const delUser = await Api.delete(`user/${id}`);

    if (delUser.response.status == 200) {
      this.setState({
        alertVisible: true,
        messageStatus: true,
        isOpenDeleteModal: false,
        successMessage: delUser.body.message,
        data: data.filter(item => item.user_id !== id)
      });
    }

    setTimeout(() => {
      this.setState({ alertVisible: false });
    }, 2000);
  }

  handleDelete(id) {
    const { data } = this.state;
    let delItem = '';
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.id === id) {
        delItem = item;
      }
    }
    this.setState({
      isOpenDeleteModal: true,
      userID: id,
      confirmationMessage: `Are you sure you want to delete ${delItem.name} ${delItem.patronymic} ${delItem.surname}?`
    });
  }

  handleConfirmationClose() {
    this.setState({
      isOpenDeleteModal: false,
      confirmationMessage: ''
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
      isOpenDeleteModal,
      confirmationMessage,
      isOpenEditModal,
      activePage,
      per_page,
      pageOptions,
      current_perPage
    } = this.state;

    return (
      <Fragment>
        <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
          {
            this.state.messageStatus ? this.state.successMessage : this.state.failMessage
          }
        </Alert>
        <Table sortable celled selectable unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width="2" className="text-center"
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
                sorted={column === 'mobile_phone' ? direction : null}
                onClick={this.handleSort.bind(this, 'mobile_phone')}
              >
                Mobile
              </Table.HeaderCell>
              <Table.HeaderCell width="4" className="text-center"
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
                    <Table.Cell>
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
                      {item.name}
                      {' '}
                      {item.patronymic == '-' ? '' : item.patronymic}
                      {' '}
                      {item.surname}
                    </Table.Cell>
                    <Table.Cell className="text-center">{item.gender ? Genders[0].name : Genders[1].name}</Table.Cell>
                    <Table.Cell className="text-center">{item.birthday}</Table.Cell>
                    <Table.Cell>{item.email}</Table.Cell>
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
                    <Table.Cell className="text-center">
                      {item.is_super ? (
                        <span>Yes</span>
                      ) : (
                        <span>No</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {/* <div className="text-center">
                        <Button
                          title="Change"
                          type="button"
                          color="purple"
                          onClick={() => this.changeSuper(item.user_id, item.email, item.is_super)}
                        >
                          <i className="fa fa-exchange-alt" />
                        </Button>
                        <Button
                          title="Remove"
                          color="red"
                          type="button"
                          onClick={() => this.handleDelete(item.id)}
                        >
                          <i className="fa fa-trash-alt" />
                        </Button>
                      </div> */}
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
              <Table.HeaderCell colSpan="7">
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
          isOpenDeleteModal && 
          <Prompt title={confirmationMessage} 
            id={this.state.userID}
            handleAccept={this.handleDeleteUser.bind(this)} 
            handleCancel={this.handleConfirmationClose.bind(this)} 
          /> 
        }
      </Fragment>
    );
  }
}

ChangeSuperTable.defaultProps = {
  
};

export default ChangeSuperTable;
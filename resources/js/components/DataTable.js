/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component, Fragment } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import { Button } from 'reactstrap';
import Select from 'react-select';
import ReactTooltip from 'react-tooltip';

import _ from 'lodash';
import { Genders } from '../configs/data';
import Bitmaps from '../theme/Bitmaps';

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      column: null,
      data: [],
      direction: null,
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
    if (this.props.items.length > 0) {
      this.setState({
        activePage: 1
      });
    }
    const { items } = this.props;
    const { per_page } = this.state;
    this.setState({
      data: items.slice(0, per_page)
    });
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps() {
    const user_info = JSON.parse(localStorage.getItem('auth'));
    if (user_info.user) {
      this.setState({
        user: user_info.user.member_info
      });
    }
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

  render() {
    const {
      onSelect,
      onDelete,
      onEdit,
      items,
      stype,
      mtype
    } = this.props;

    const {
      user,
      column,
      direction,
      data,
      activePage,
      per_page,
      pageOptions,
      current_perPage
    } = this.state;
    
    return (
      <Table sortable celled selectable unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              className="text-center"
              sorted={column === 'name' ? direction : null}
              onClick={this.handleSort.bind(this, 'name')}
            >
              Name
            </Table.HeaderCell>
            {
              (stype.value === 'org' || stype.value === 'club') && (
                <Table.HeaderCell
                  className="text-center"
                  sorted={column === 'register_no' ? direction : null}
                  onClick={this.handleSort.bind(this, 'register_no')}
                >
                  Register No
                </Table.HeaderCell>
              )
            }
            {
              stype.value === 'member' && (
                <Fragment>
                  <Table.HeaderCell
                    className="text-center"
                    width="2"
                    sorted={column === 'name_o' ? direction : null}
                    onClick={this.handleSort.bind(this, 'name_o')}
                  >
                    {mtype.value === 'judoka' || mtype.value === 'coach' ? 'Club' : 'Regional Federation'}
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    className="text-center"
                    sorted={column === 'gender' ? direction : null}
                    onClick={this.handleSort.bind(this, 'gender')}
                  >
                    Gender
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    className="text-center"
                    sorted={column === 'birthday' ? direction : null}
                    onClick={this.handleSort.bind(this, 'birthday')}
                  >
                    Birthday
                  </Table.HeaderCell>
                </Fragment>
              )
            }
            {
              mtype.value !== 'judoka' && (
                <Fragment>
                  <Table.HeaderCell
                    width="1"
                    className="text-center"
                    sorted={column === 'mobile_phone' ? direction : null}
                    onClick={this.handleSort.bind(this, 'mobile_phone')}
                  >
                    Mobile
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    className="text-center"
                    width="3"
                    sorted={column === 'email' ? direction : null}
                    onClick={this.handleSort.bind(this, 'email')}
                  >
                    Email
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    className="text-center"
                    width="6"
                    sorted={column === 'addressline1' ? direction : null}
                    onClick={this.handleSort.bind(this, 'addressline1')}
                  >
                    Address
                  </Table.HeaderCell>
                </Fragment>
              )
            }
            {
              stype.value === 'member' && mtype.value === 'judoka' && (
                <Fragment>
                  <Table.HeaderCell
                    className="text-center"
                    sorted={column === 'weight' ? direction : null}
                    onClick={this.handleSort.bind(this, 'weight')}
                  >
                    Weight
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    className="text-center"
                    sorted={column === 'dan' ? direction : null}
                    onClick={this.handleSort.bind(this, 'dan')}
                  >
                    Dan
                  </Table.HeaderCell>
                  <Table.HeaderCell className="text-center">
                    Status
                  </Table.HeaderCell>
                </Fragment>
              )
            }
            <Table.HeaderCell className="text-center" width="2">
              Edit / Delete
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data && data.length > 0 && (
              data.map((item, index) => (
                <Table.Row
                  key={index}
                  disabled={mtype.value == 'judoka' && item.active == 0}
                >
                  <Table.Cell>
                    <span className="text-primary mr-2">
                      {
                        stype.value !== 'member' ? (
                          <Fragment>
                            <a data-tip data-for={`happyFace_${index}`}><i className="fa fa-users fa-lg" /></a>
                            <ReactTooltip
                              id={`happyFace_${index}`}
                              type="light"
                              effect="float"
                              place="right"
                              className="avatar-tooltip"
                            >
                              <div className="avatar-preview"><img src={item.logo ? item.logo : Bitmaps.logo} /></div>
                            </ReactTooltip>
                          </Fragment>
                        ) : (
                          <Fragment>
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
                          </Fragment>
                        )
                      }
                    </span>
                    {
                      stype.value === 'member' ? (
                        <a className="detail-link" onClick={() => onSelect(item.id)}>
                          {item.surname && item.surname.toUpperCase()} {item.patronymic != '-' && item.patronymic} {item.name}
                        </a>
                      ) : (
                        <a className="detail-link" onClick={() => onSelect(item.id)}>{item.name_o}</a>
                      )
                    }
                  </Table.Cell>
                  {
                    (stype.value === 'org' || stype.value === 'club') && (
                      <Fragment>
                        <Table.Cell className="text-center">{item.register_no}</Table.Cell>
                      </Fragment>
                    )
                  }
                  {
                    stype.value === 'member' && (
                      <Fragment>
                        <Table.Cell>{item.name_o}</Table.Cell>
                        <Table.Cell className="text-center">{item.gender && item.gender == 1 ? Genders[0].name : Genders[1].name}</Table.Cell>
                        <Table.Cell className="text-center">{item.birthday}</Table.Cell>
                      </Fragment>
                    )
                  }
                  {
                    mtype.value !== 'judoka' && (
                      <Fragment>
                        <Table.Cell className="text-center">{item.mobile_phone}</Table.Cell>
                        <Table.Cell className="text-center">{item.email}</Table.Cell>
                        <Table.Cell>
                          {(item.addressline1 && item.addressline1 != '' && item.addressline1 != '-') ? item.addressline1 + ', ' : '' }
                          {(item.addressline2 && item.addressline2 != '' && item.addressline2 != '-') ? item.addressline2 + ', ' : '' }
                          {(item.city && item.city != '' && item.city != '-') ? item.city + ', ' : '' }
                          {(item.state && item.state != '' && item.state != '-') ? item.state + ', ' : '' }
                          {item.zip_code}
                        </Table.Cell>
                      </Fragment>
                    )
                  }
                  {
                    stype.value === 'member' && mtype.value === 'judoka' && (
                      <Fragment>
                        <Table.Cell className="text-center">{item.weight} Kg</Table.Cell>
                        <Table.Cell className="text-center">{item.dan}</Table.Cell>
                          {
                            item.active == 0 && (
                              <Table.Cell className="text-center">
                                <div className="text-danger text-center">
                                  <i className="fa fa-user fa-lg" />
                                </div>
                              </Table.Cell>
                            )
                          }
                          {
                            item.active == 1 && (
                              <Table.Cell className="text-center">
                                <div className="text-success text-center">
                                  <i className="fa fa-user fa-lg" />
                                </div>
                              </Table.Cell>
                            )
                          }
                          {
                            item.active == 2 && (
                              <Table.Cell className="text-center">
                                <div className="text-warning text-center">
                                  <i className="fa fa-user fa-lg" />
                                </div>
                              </Table.Cell>
                            )
                          }
                      </Fragment>
                    )
                  }
                  <Table.Cell>
                    <div className="actions d-flex w-100 justify-content-center align-items-center">
                      <Button
                        color="success"
                        type="button"
                        onClick={() => onEdit(item.id, index)}
                        style={{ marginRight: '20px' }}
                      >
                        <i className="fa fa-pencil-alt fa-lg" />
                      </Button>
                      {
                        (item.parent_id && item.parent_id !== 0) || (item.name && item.id !== user.id) ? (
                          <Button
                            color="danger"
                            type="button"
                            onClick={() => onDelete(item.id)}
                          >
                            <i className="fa fa-trash-alt fa-lg" />
                          </Button>
                        ) : <div className="px-3"></div>
                      }
                    </div>
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
            <Table.HeaderCell colSpan={stype.value === 'member' ? 8 : 5}>
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
    );
  }
}

DataTable.defaultProps = {
  onDelete: () => {},
  onEdit: () => {},
  onSelect: () => {}
};

export default DataTable;

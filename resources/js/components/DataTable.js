
import React, { Component, Fragment } from 'react';
import {
  Table,
  Pagination,
  Menu,
  Flag
} from 'semantic-ui-react';
import { Button } from 'reactstrap';
import Select from 'react-select';

import _ from 'lodash';
import { countries, Genders } from '../configs/data';

const flagRenderer = item => <Flag name={item.countryCode} />;

class DataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    this.getCountryCode = this.getCountryCode.bind(this);
    this.handleChangePerPage = this.handleChangePerPage.bind(this);
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
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
      type
    } = this.props;
    const {
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
              sorted={column === 'name' ? direction : null}
              onClick={this.handleSort.bind(this, 'name')}
            >
              Name
            </Table.HeaderCell>
            {
              type.value === 'player' && (
                <Fragment>
                  <Table.HeaderCell
                    sorted={column === 'gender' ? direction : null}
                    onClick={this.handleSort.bind(this, 'gender')}
                  >
                    Gender
                  </Table.HeaderCell>
                  <Table.HeaderCell
                    sorted={column === 'birthday' ? direction : null}
                    onClick={this.handleSort.bind(this, 'birthday')}
                  >
                    Birthday
                  </Table.HeaderCell>
                </Fragment>
              )
            }
            <Table.HeaderCell
              sorted={column === 'email' ? direction : null}
              onClick={this.handleSort.bind(this, 'email')}
            >
              Email
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'country' ? direction : null}
              onClick={this.handleSort.bind(this, 'country')}
            >
              Country
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'mobile_phone' ? direction : null}
              onClick={this.handleSort.bind(this, 'mobile_phone')}
            >
              Mobile
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === 'addressline1' ? direction : null}
              onClick={this.handleSort.bind(this, 'addressline1')}
            >
              Address
            </Table.HeaderCell>
            {
              type.value === 'player' && (
                <Table.HeaderCell>
                  Active
                </Table.HeaderCell>
              )
            }
            <Table.HeaderCell width="2"></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data && data.length > 0 && (
              data.map((item, index) => (
                <Table.Row key={index} onDoubleClick={() => onSelect(item.id)}>
                  <Table.Cell>{item.name}</Table.Cell>
                  {
                    type.value === 'player' && (
                      <Fragment>
                        <Table.Cell>{Genders[item.gender - 1].name}</Table.Cell>
                        <Table.Cell>{item.birthday}</Table.Cell>
                      </Fragment>
                    )
                  }
                  <Table.Cell>{item.email}</Table.Cell>
                  <Table.Cell>
                    {this.getCountryCode(item.country)}
                    {' '}
                    {countries.filter(country => country.countryCode === item.country).length > 0 && countries.filter(country => country.countryCode === item.country)[0].name}
                  </Table.Cell>
                  <Table.Cell>{item.mobile_phone}</Table.Cell>
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
                  {
                    type.value === 'player' && (
                      <Table.Cell>
                        {
                          item.active ? (
                            <div className="text-warning text-center">
                              <i className="fa fa-trophy fa-lg" />
                            </div>
                          ) : (
                            <div className="text-muted text-center">
                              <i className="fa fa-trophy fa-lg" />
                            </div>
                          )
                        }
                      </Table.Cell>
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
                      <Button
                        color="danger"
                        type="button"
                        onClick={() => onDelete(item.id)}
                      >
                        <i className="fa fa-trash-alt fa-lg" />
                      </Button>
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
            <Table.HeaderCell colSpan={type.value === 'player' ? 8 : 5}>
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
  items: [],
  onDelete: () => {},
  onEdit: () => {},
  onSelect: () => {}
};

export default DataTable;

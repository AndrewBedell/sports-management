/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component, Fragment } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import Select from 'react-select';

import _ from 'lodash';

class TransactionTable extends Component {
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
        { label: 20, value: 20 },
        { label: 50, value: 50 }
      ]
    };
    this.handleChangePerPage = this.handleChangePerPage.bind(this);
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps() {
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
              width="2"
              className="text-center"
              onClick={this.handleSort.bind(this, 'club')}
            >
              Regional Federation/Club
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              onClick={this.handleSort.bind(this, 'name')}
            >
              Name
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              onClick={this.handleSort.bind(this, 'players')}
            >
              Players
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              onClick={this.handleSort.bind(this, 'price')}
            >
              Price
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              onClick={this.handleSort.bind(this, 'percent')}
            >
              Percent
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              onClick={this.handleSort.bind(this, 'amount')}
            >
              Amount
            </Table.HeaderCell>
            <Table.HeaderCell
              className="text-center"
              onClick={this.handleSort.bind(this, 'date')}
            >
              Date
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
        {
          data && data.length > 0 && (
            data.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>{item.Reg} / {item.Club}</Table.Cell>
                <Table.Cell>{item.name} {item.surname}</Table.Cell>
                <Table.Cell className="text-center">
                  <a className="detail-link text-underline" onClick={() => onSelect(item.id)}>
                    {item.players.length}
                  </a>
                </Table.Cell>
                <Table.Cell className="text-center">{item.price}</Table.Cell>
                <Table.Cell className="text-center">{item.percent}</Table.Cell>
                <Table.Cell className="text-center">{item.amount}</Table.Cell>
                <Table.Cell className="text-center">{item.created_at.substring(0,10)}</Table.Cell>
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
            <Table.HeaderCell colSpan="6">
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

TransactionTable.defaultProps = {
  onDelete: () => {},
  onEdit: () => {},
  onSelect: () => {}
};

export default TransactionTable;

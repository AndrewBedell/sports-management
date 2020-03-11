/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import Select from 'react-select';
import _ from 'lodash';
import { Genders } from '../configs/data';

class PlayerPayTable extends Component {
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
    if (this.props.players.length > 0) {
      this.setState({
        activePage: 1
      });
    }
    
    const { players } = this.props;
    const { per_page } = this.state;
    this.setState({
      data: players.slice(0, per_page)
    });
  }

  handlePaginationChange(e, { activePage }) {
    const { players } = this.props;
    const { per_page } = this.state;
    if (activePage !== 1) {
      this.setState({
        activePage,
        data: players.slice(((activePage - 1) * per_page), activePage * per_page)
      });
    } else {
      this.setState({
        activePage,
        data: players.slice(0, per_page)
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
    const { players } = this.props;
    this.setState({
      activePage: 1,
      current_perPage: page_num,
      per_page: page_num.value,
      data: players.slice(0, page_num.value)
    });
  }

  render() {
    const {
      players
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
              className="text-center"
              sorted={column === 'name' ? direction : null}
              onClick={this.handleSort.bind(this, 'name')}
            >
              Name
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
          </Table.Row>
        </Table.Header>
        <Table.Body>
        {
          data && data.length > 0 && (
            data.map((player, k) => (
              <Table.Row key={k}>
                <Table.Cell>{player.name} {player.surname}</Table.Cell>
                <Table.Cell className="text-center">
                  {player.gender && player.gender == 1 ? Genders[0].name : Genders[1].name}
                </Table.Cell>
                <Table.Cell className="text-center">{player.weight}</Table.Cell>
                <Table.Cell className="text-center">{player.dan}</Table.Cell>
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
            <Table.HeaderCell colSpan="3">
              <Menu floated="right" pagination>
                <Pagination
                  activePage={activePage}
                  onPageChange={this.handlePaginationChange.bind(this)}
                  totalPages={Math.ceil(players.length / per_page)}
                />
              </Menu>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default PlayerPayTable;
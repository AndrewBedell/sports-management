/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import {
  Table,
  Pagination,
  Menu
} from 'semantic-ui-react';
import { CustomInput } from 'reactstrap';
import Select from 'react-select';
import ReactTooltip from 'react-tooltip';

import _ from 'lodash';
import { Genders } from '../configs/data';
import Bitmaps from '../theme/Bitmaps';

class PlayerTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      selectedPlayers: [],
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

  handleSelect(player, index, event) {
    const { selectedPlayers, data } = this.state;
    if (event.target.checked) {
      data[index].checked = true;
      selectedPlayers.push(player);
    } else {
      data[index].checked = false;
      selectedPlayers.filter(item => item.id !== player.id);
    }
    this.setState({
      selectedPlayers
    });
    console.log(selectedPlayers);
  }

  handleSelectAll() {
    const { data, selectedPlayers } = this.state;
    console.log(data);
  }

  render() {
    const {
      onDetail,
      items
    } = this.props;

    const {
      column,
      direction,
      data,
      activePage,
      per_page,
      pageOptions,
      current_perPage,
      selectedAll
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
              width="2"
              sorted={column === 'name_o' ? direction : null}
              onClick={this.handleSort.bind(this, 'name_o')}
            >
              Club
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
            <Table.HeaderCell className="text-center" width="2">
              <CustomInput
                id="selectAll"
                type="checkbox"
                checked={selectedAll}
                onChange={this.handleSelectAll.bind(this)}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            data && data.length > 0 && (
              data.map((item, index) => (
                <Table.Row
                  key={index}
                >
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
                    <a className="detail-link" onClick={() => onDetail(item.id)}>
                      {item.surname && item.surname.toUpperCase()}
                      {' '}
                      {item.patronymic !== '-' && item.patronymic}
                      {' '}
                      {item.name}
                    </a>
                  </Table.Cell>
                  <Table.Cell>{item.name_o}</Table.Cell>
                  <Table.Cell className="text-center">{item.gender && item.gender === 1 ? Genders[0].name : Genders[1].name}</Table.Cell>
                  <Table.Cell className="text-center">{item.birthday}</Table.Cell>
                  <Table.Cell className="text-center">
                    {item.weight}
                    {' '}
                    Kg
                  </Table.Cell>
                  <Table.Cell className="text-center">{item.dan}</Table.Cell>
                  {
                    item.active === 0 && (
                      <Table.Cell className="text-center">
                        <div className="text-danger text-center">
                          <i className="fa fa-user fa-lg" />
                        </div>
                      </Table.Cell>
                    )
                  }
                  {
                    item.active === 1 && (
                      <Table.Cell className="text-center">
                        <div className="text-success text-center">
                          <i className="fa fa-user fa-lg" />
                        </div>
                      </Table.Cell>
                    )
                  }
                  {
                    item.active === 2 && (
                      <Table.Cell className="text-center">
                        <div className="text-warning text-center">
                          <i className="fa fa-user fa-lg" />
                        </div>
                      </Table.Cell>
                    )
                  }
                  <Table.Cell className="text-center">
                    <CustomInput
                      id={item.id}
                      type="checkbox"
                      checked={item.checked}
                      onChange={this.handleSelect.bind(this, item, index)}
                    />
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
    );
  }
}

PlayerTable.defaultProps = {
  onSelectAll: () => {},
  onSelect: () => {},
  onDetail: () => {}
};

export default PlayerTable;

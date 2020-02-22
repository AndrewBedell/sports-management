/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import Select from 'react-select';
import {
  Container,
  Row,
  Col,
  FormGroup,
  Button,
  Input,
  FormFeedback,
  Alert
} from 'reactstrap';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import DataTable from '../../components/DataTable';
import Prompt from '../../components/Prompt';
import EditModal from './EditModal';
import { Dans, search_type_options } from '../../configs/data';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orgs: [],
      org_list: [],
      weights: [],
      roles: [],
      search_required: true,
      search_type: '',
      search_orgs: [],
      search_name: '',
      search_weight: [],
      search_dan: [],
      search_data: null,
      isOpenDeleteModal: false,
      isOpenEditModal: false,
      edit_item: '',
      confirmationMessage: '',
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
      deleteId: '',
      error: {
        search_type: 'This field is required!'
      }
    };
    this.handleSearchFilter = this.handleSearchFilter.bind(this);
    this.handleDeleteMember = this.handleDeleteMember.bind(this);
    this.handleConfirmationClose = this.handleConfirmationClose.bind(this);
    this.handleSaveItem = this.handleSaveItem.bind(this);
  }

  async componentDidMount() {
    const org_response = await Api.get('organizations-list');
    const { response, body } = org_response;
    switch (response.status) {
      case 200:
        this.setState({
          orgs: body,
          org_list: body
        });
        break;
      default:
        break;
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
    const role_list = await Api.get('roles');
    switch (role_list.response.status) {
      case 200:
        this.setState({
          roles: role_list.body
        });
        break;
      default:
        break;
    }
  }

  handleSearchFilter(type, value) {
    const { orgs } = this.state;
    switch (type) {
      case 'type':
        this.setState({
          search_type: value,
          search_required: true,
          search_data: null
        });
        if (value.value !== 'player') {
          this.setState({
            org_list: orgs.filter(org => org.is_club !== 1)
          });
        } else {
          this.setState({
            org_list: orgs
          });
        }
        break;
      case 'orgs':
        this.setState({
          search_orgs: value,
          search_data: null
        });
        break;
      case 'name':
        this.setState({
          search_name: value,
          search_data: null
        });
        break;
      case 'weight':
        this.setState({
          search_weight: value,
          search_data: null
        });
        break;
      case 'dan':
        this.setState({
          search_dan: value,
          search_data: null
        });
        break;
      default:
        break;
    }
  }

  async handleSearch() {
    const {
      search_type, search_orgs, search_name, search_weight, search_dan
    } = this.state;
    const orgs_search = [];
    const weight_search = [];
    const dan_search = [];
    if (search_orgs.length > 0) {
      for (let i = 0; i < search_orgs.length; i++) {
        const org = search_orgs[i];
        orgs_search.push(org.id);
      }
    }
    if (search_weight.length > 0) {
      for (let j = 0; j < search_weight.length; j++) {
        const weight = search_weight[j];
        weight_search.push(weight.id);
      }
    }
    if (search_dan.length > 0) {
      for (let k = 0; k < search_dan.length; k++) {
        const dan = search_dan[k];
        dan_search.push(dan.value);
      }
    }
    const search_params = {
      type: search_type ? search_type.value : '',
      org: orgs_search,
      name: search_name,
      weight: weight_search,
      dan: dan_search
    };

    if (search_type) {
      const search_response = await Api.get('search', search_params);
      const { response, body } = search_response;
      switch (response.status) {
        case 200:
          this.setState({
            search_data: body
          });
          break;
        default:
          break;
      }
    } else {
      this.setState({
        search_required: false
      });
    }
  }

  handleEdit(id) {
    const { isOpenEditModal } = this.state;
    this.setState({
      isOpenEditModal: !isOpenEditModal,
      edit_item: id
    });
  }

  handleDelete(id) {
    const { search_data } = this.state;
    let delItem = '';
    for (let i = 0; i < search_data.length; i++) {
      const item = search_data[i];
      if (item.id === id) {
        delItem = item;
      }
    }
    this.setState({
      isOpenDeleteModal: true,
      deleteId: id,
      confirmationMessage: `Are you sure you want to delete ${delItem.name}?`
    });
  }

  async handleDeleteMember(id) {
    const { search_type, search_data } = this.state;
    if (search_type.value !== 'player') {
      const delOrg = await Api.delete(`organization/${id}`);
      switch (delOrg.response.status) {
        case 200:
          this.setState({
            alertVisible: true,
            messageStatus: true,
            isOpenDeleteModal: false,
            successMessage: delOrg.body.message,
            search_data: search_data.filter(item => item.id !== id)
          });
          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenDeleteModal: false,
            failMessage: delOrg.body.message
          });
          break;
        default:
          break;
      }
    } else {
      const delMem = await Api.delete(`member/${id}`);
      switch (delMem.response.status) {
        case 200:
          this.setState({
            alertVisible: true,
            messageStatus: true,
            isOpenDeleteModal: false,
            successMessage: delMem.body.message,
            search_data: search_data.filter(item => item.id !== id)
          });
          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenDeleteModal: false,
            failMessage: delMem.body.message
          });
          break;
        default:
          break;
      }
    }
    setTimeout(() => {
      this.setState({ alertVisible: false });
    }, 2000);
  }

  async handleSaveItem(item) {
    console.log(item);
  }

  handleConfirmationClose() {
    this.setState({
      isOpenDeleteModal: false,
      confirmationMessage: ''
    });
  }

  handleCreateAccount() {
    this.props.history.push('/organizations/create');
  }

  handleRegisterMember() {
    this.props.history.push('/members/register');
  }

  render() {
    const {
      org_list,
      weights,
      roles,
      search_type,
      search_orgs,
      search_name,
      search_weight,
      search_dan,
      search_required,
      error,
      search_data,
      isOpenDeleteModal,
      confirmationMessage,
      isOpenEditModal,
      edit_item
    } = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container fluid>
            <h3 className="text-danger text-center mb-5">Welcome to National Sports Federation Management System!</h3>
            <Row>
              <Col xl="2" lg="3" md="4" sm="6" xs="12">
                <FormGroup>
                  <Select
                    name="type"
                    classNamePrefix="react-select-lg"
                    placeholder="Search Type"
                    indicatorSeparator={null}
                    value={search_type}
                    options={search_type_options}
                    getOptionValue={option => option.value}
                    getOptionLabel={option => option.label}
                    onChange={(type) => {
                      this.handleSearchFilter('type', type);
                    }}
                  />
                  {
                    !search_required && (
                      <FormFeedback className="d-block">{error.search_type}</FormFeedback>
                    )
                  }
                </FormGroup>
              </Col>
              <Col xl="2" lg="3" md="4" sm="6" xs="12">
                <FormGroup>
                  <Select
                    name="orgs"
                    classNamePrefix="react-select-lg"
                    placeholder="Search Orgs"
                    isMulti
                    value={search_orgs}
                    options={org_list}
                    getOptionValue={option => option.id}
                    getOptionLabel={option => option.name}
                    onChange={(org) => {
                      this.handleSearchFilter('orgs', org);
                    }}
                  />
                </FormGroup>
              </Col>
              <Col xl="2" lg="3" md="4" sm="6" xs="12">
                <FormGroup>
                  <Input
                    type="text"
                    value={search_name}
                    placeholder="Name"
                    onChange={event => this.handleSearchFilter('name', event.target.value)}
                  />
                </FormGroup>
              </Col>
              {
                search_type.value === 'player' && (
                  <Col xl="2" lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="weight"
                        classNamePrefix="react-select-lg"
                        placeholder="Search Weight"
                        isMulti
                        value={search_weight}
                        options={weights}
                        getOptionValue={option => option.id}
                        getOptionLabel={option => option.name}
                        onChange={(weight) => {
                          this.handleSearchFilter('weight', weight);
                        }}
                      />
                    </FormGroup>
                  </Col>
                )
              }
              {
                search_type.value === 'player' && (
                  <Col xl="2" lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="dan"
                        classNamePrefix="react-select-lg"
                        placeholder="Search Dan"
                        isMulti
                        value={search_dan}
                        options={Dans}
                        getOptionValue={option => option.value}
                        getOptionLabel={option => option.label}
                        onChange={(dan) => {
                          this.handleSearchFilter('dan', dan);
                        }}
                      />
                    </FormGroup>
                  </Col>
                )
              }
              <Col xl={search_type.value === 'player' ? 2 : 6} lg={search_type.value === 'player' ? 9 : 3} md={search_type.value === 'player' ? 4 : 12} sm="6" xs="12">
                <div className="text-right">
                  <FormGroup>
                    <Button
                      type="button"
                      color="success"
                      className="btn-lg"
                      onClick={this.handleSearch.bind(this)}
                    >
                      Search
                    </Button>
                  </FormGroup>
                </div>
              </Col>
            </Row>
          </Container>
          <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
            {
              this.state.messageStatus ? this.state.successMessage : this.state.failMessage
            }
          </Alert>
          {
            search_data === null && (
              <Container fluid>
                WOW
              </Container>
            )
          }
          {
            search_data && search_data.length === 0 && (
              <div className="fixed-content">
                <h3 className="text-muted">
                  No results!
                </h3>
              </div>
            )
          }
          {
            search_data && search_data.length > 0 && (
              <Container fluid>
                <div className="table-responsive">
                  <DataTable
                    items={search_data}
                    onEdit={this.handleEdit.bind(this)}
                    onDelete={this.handleDelete.bind(this)}
                  />
                </div>
              </Container>
            )
          }
        </div>
        { isOpenDeleteModal && <Prompt title={confirmationMessage} id={this.state.deleteId} handleAccept={this.handleDeleteMember} handleCancel={this.handleConfirmationClose} /> }
        {
          isOpenEditModal && (
          <EditModal
            id={edit_item}
            type={search_type}
            weights={weights}
            orgs={org_list}
            roles={roles}
            handleSave={this.handleSaveItem}
            handleCancel={this.handleEdit.bind(this)}
          />
          )
        }
        <div className="fixed-button left">
          <Button
            type="button"
            color="secondary"
            onClick={this.handleCreateAccount.bind(this)}
          >
            Creating Account
          </Button>
        </div>
        <div className="fixed-button right">
          <Button
            type="button"
            color="secondary"
            onClick={this.handleRegisterMember.bind(this)}
          >
            Registering Member
          </Button>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Dashboard);

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
  FormFeedback,
  Alert
} from 'reactstrap';
import { Input, Search } from 'semantic-ui-react';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import DataTable from '../../components/DataTable';
import Prompt from '../../components/Prompt';
import EditModal from '../../components/EditModal';
import { Dans, search_genders, search_type_options, member_type_options } from '../../configs/data';
import QueryString from 'qs';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      org_list: [],
      orgs: [],
      weights: [],
      roles: [],
      clubs: [],
      original_clubs: [],
      search_required: true,
      member_required: true,
      search_type: '',
      member_type: '',
      search_org: '',
      search_name: '',
      search_gender: search_genders[0],
      search_weight: '',
      search_dan: '',
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
      editIndex: -1,
      errors: {
        required: 'This field is required!'
      }
    };

    this.handleSearchFilter = this.handleSearchFilter.bind(this);
    this.handleDeleteMember = this.handleDeleteMember.bind(this);
    this.handleConfirmationClose = this.handleConfirmationClose.bind(this);
    this.handleSaveItem = this.handleSaveItem.bind(this);
    this.getWeights = this.getWeights.bind(this);
    this.search = this.search.bind(this);
  }

  componentDidMount() {
    this.componentWillReceiveProps();
  }

  async componentWillReceiveProps() {
    const org_response = await Api.get('organizations-list');
    const { response, body } = org_response;
    switch (response.status) {
      case 200:
        let orgArr = [];

        for (var i = 0; i < body.length; i++) {
          orgArr.push(body[i]['name_o'])
        }

        const orgList = orgArr.map((org, Index) =>
          <option key={Index} value={org} />
        );

        this.setState({
          orgs: orgList,
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
        if (role_list.body.length > 0) {
          localStorage.setItem('roles', JSON.stringify(role_list.body));
        }
        break;
      default:
        break;
    }

    const club_list = await Api.get('clubs');
    let clubArr = [];
    switch (club_list.response.status) {
      case 200:

        for (var i = 0; i < club_list.body.length; i++) {
          clubArr.push({id: club_list.body[i]['parent_id'], value: club_list.body[i]['name_o']});
        }

        // let clubs1 = clubArr;
        // if (search.org != '') {
        //   clubs1 = clubArr.filter(club => club.id == search.org);
        // }

        // const clubList = clubs1.map((club, Index) =>
        //   <option key={Index} id={club.id} value={club.value} />
        // );
        
        this.setState({
          // clubs: clubList,
          original_clubs: clubArr,
        });
        break;
      default:
        break;
    }

    const search = QueryString.parse(this.props.location.search, { ignoreQueryPrefix: true });
    
    let clubs1 = clubArr;
    if (search.org != '') {
      clubs1 = clubArr.filter(club => club.id == search.org);
    }

    const clubList = clubs1.map((club, Index) =>
      <option key={Index} id={club.id} value={club.value} />
    );

    this.setState({
      search_type: search.stype ? (search_type_options.find(type => type.value == search.stype) || '') : '',
      search_org: search.org ? (org_response.body.find(org => org.id == search.org) || '') : '',
      search_name: search.name || '',
      member_type: search.mtype ? (member_type_options.find(option => option.value == search.mtype) || '') : '',
      search_gender: search.gender ?
                      (search_genders.find(gender => gender.value == search.gender) || search_genders[0])
                    : search_genders[0],
      search_weight: search.weight ? (weight_list.body.find(weight => weight.id == search.weight) || '') : '',
      search_dan: search.dan ? (Dans.find(dan => dan.value == search.dan) || '') : '',
      search_data: null,
      clubs: clubList,
    });
    // const search = {};
    if (search.stype) {
      this.search(search);
    }
  }

  handleSearchFilter(type, value) {
    switch (type) {
      case 'search_type':
        this.setState({
          search_type: value,
          search_required: true,
          search_org: '',
          search_data: null
        });
        break;
      case 'search_org':
        const clubsFiltered = this.state.original_clubs.filter((club) => club.id == value.id).map((club, Index) =>
          <option key={Index} id={club.id} value={club.value} />
        );
        
        this.setState({
          search_org: value,
          clubs: clubsFiltered,
          search_data: null
        });
        break;
      case 'search_name':
        this.setState({
          search_name: value,
          search_data: null
        });
        break;
      case 'member_type':
        this.setState({
          member_type: value,
          search_required: true,
          member_required: true,
          search_data: null
        });
        break;
      case 'search_gender':
        this.setState({
          search_gender: value,
          search_data: null
        });
        break;
      case 'search_weight':
        this.setState({
          search_weight: value,
          search_data: null
        });
        break;
      case 'search_dan':
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
      search_type, search_org, search_name, member_type, search_gender, search_weight, search_dan
    } = this.state;

    const search_params = {
      stype: search_type ? search_type.value : '',
      org: search_org ? search_org.id : '',
      name: search_name,
      mtype: member_type ? member_type.value : '',
      gender: search_gender ? search_gender.value : search_genders[0],
      weight: search_weight ? search_weight.id : '',
      dan: search_dan ? search_dan.value : ''
    };

    if (!search_params.stype) {
      this.setState({
        search_required: false
      });
      return;
    }

    if (search_params.stype == 'member' && !search_params.mtype) {
      this.setState({
        member_required: false,
      });
      return
    }

    this.props.history.push(`/${QueryString.stringify(search_params, { addQueryPrefix: true })}`);
  }

  async search(search_params) {
    // const {
    //   search_type, search_org, search_name, member_type, search_gender, search_weight, search_dan
    // } = this.state;

    // const search_params = {
    //   stype: search_type ? search_type.value : '',
    //   org: search_org ? search_org.id : '',
    //   name: search_name,
    //   mtype: member_type ? member_type.value : '',
    //   gender: search_gender ? search_gender.value : search_genders[0],
    //   weight: search_weight ? search_weight.id : '',
    //   dan: search_dan ? search_dan.value : ''
    // }

    if (search_params.stype == 'member' && !search_params.mtype) {
      return;
    } else {
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
    }
  }

  handleEdit(id, index) {
    const { isOpenEditModal } = this.state;
    this.setState({
      isOpenEditModal: !isOpenEditModal,
      edit_item: id,
      editIndex: index
    });
  }

  handleDelete(id) {
    const { search_data, search_type } = this.state;
    let delItem = '';
    for (let i = 0; i < search_data.length; i++) {
      const item = search_data[i];
      if (item.id == id) {
        delItem = item;
      }
    }
    
    this.setState({
      isOpenDeleteModal: true,
      deleteId: id,
      confirmationMessage: `Are you sure you want to delete "${search_type.value == 'member' ? 
        `${delItem.name} ${delItem.surname}` : delItem.name_o}"?`
    });
  }

  async handleDeleteMember(id) {
    const { search_type, search_data } = this.state;
    if (search_type.value !== 'member') {
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

  async handleSaveItem(id, item) {
    const {
      search_type, editIndex, search_data
    } = this.state;
    if (search_type.value !== 'member') {
      const updateOrg = await Api.put(`organization/${id}`, item);
      switch (updateOrg.response.status) {
        case 200:
          search_data[editIndex] = item;
          this.setState({
            isOpenEditModal: false,
            messageStatus: true,
            alertVisible: true,
            successMessage: `${item.name_o} is been update successfully!`,
            search_data
          });
          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: true,
            failMessage: updateOrg.body.message
          });
          break;
        case 422:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: updateOrg.body.data && (`${updateOrg.body.data.email !== undefined ? updateOrg.body.data.email : ''} ${updateOrg.body.data.register_no !== undefined ? updateOrg.body.data.register_no : ''} ${updateOrg.body.data.readable_id !== undefined ? updateOrg.body.data.readable_id : ''}`)
          });
          break;
        case 500:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: 'Internal Server Error!'
          });
          break;
        default:
          break;
      }
    } else {
      const updateMem = await Api.put(`member/${id}`, item);
      switch (updateMem.response.status) {
        case 200:
          this.setState({
            isOpenEditModal: false,
            messageStatus: true,
            alertVisible: true,
            successMessage: `${item.name} ${item.surname} is been update successfully!`
          });
          
          search_data[editIndex] = item;

          this.setState({
            search_data
          });
          
          break;
        case 406:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: updateMem.body.message
          });
          break;
        case 422:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: updateMem.body.data && (`${updateMem.body.data.email !== undefined ? updateMem.body.data.email : ''} ${updateMem.body.data.identity !== undefined ? updateMem.body.data.identity : ''}`)
          });
          break;
        case 500:
          this.setState({
            alertVisible: true,
            messageStatus: false,
            isOpenEditModal: false,
            failMessage: 'Internal Server Error!'
          });
          break;
        default:
          break;
      }
    }
    setTimeout(() => {
      this.setState({ alertVisible: false });
    }, 3000);
  }

  handleConfirmationClose() {
    this.setState({
      isOpenDeleteModal: false,
      confirmationMessage: ''
    });
  }

  handleCreateAccount() {
    this.props.history.push('/organization/create');
  }

  handleRegisterMember() {
    this.props.history.push('/member/register');
  }

  handleSelectItem(id) {
    const { search_type } = this.state;
    if (search_type.value == 'member') {
      this.props.history.push('/member/detail', id);
    } else {
      this.props.history.push('/organization/detail', id);
    }
  }

  getWeights(gender) {
    return this.state.weights.filter(weight => {
      if (gender + '' == '2') {
        return true;
      } else {
        return weight.gender + '' == gender + '';
      }
    })
  }

  render() {
    const {
      org_list,
      orgs,
      roles,
      search_type,
      member_type,
      weights,
      clubs,
      search_org,
      search_name,
      search_gender,
      search_weight,
      search_dan,
      search_required,
      member_required,
      search_data,
      errors,
      isOpenDeleteModal,
      confirmationMessage,
      isOpenEditModal,
      edit_item
    } = this.state;
    
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content dashboard">
          <Container fluid>
            <h3 className="text-danger text-center mb-5">Welcome to National Sports Federation Management System!</h3>
              <div className="text-center mb-4">
                <Button
                  className="mr-5"
                  type="button"
                  color="secondary"
                  onClick={this.handleCreateAccount.bind(this)}
                >
                  Register Federation / Club
                </Button>
                <Button
                  className="ml-5"
                  type="button"
                  color="secondary"
                  onClick={this.handleRegisterMember.bind(this)}
                >
                  Register Member
                </Button>
              </div>
            <Row>
              <Col xl="2" lg="3" md="4" sm="6" xs="12">
                <FormGroup>
                  <Select
                    name="search_type"
                    classNamePrefix={!search_required ? 'invalid react-select-lg' : 'react-select-lg'}
                    placeholder="Search Type"
                    indicatorSeparator={null}
                    value={search_type}
                    options={search_type_options}
                    getOptionValue={option => option.value}
                    getOptionLabel={option => option.label}
                    onChange={(type) => {
                      this.handleSearchFilter('search_type', type);
                    }}
                  />
                  {
                    !search_required && (
                      <FormFeedback className="d-block">{errors.required}</FormFeedback>
                    )
                  }
                </FormGroup>
              </Col>
              {
                search_type.value == 'org' && (
                  <Col xl="3" lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Input
                        className="club-list"
                        list="orgs"
                        name="search_name"
                        type="text"
                        value={search_name}
                        placeholder="Regional Federation Name"
                        onChange={event => this.handleSearchFilter('search_name', event.target.value)}
                      />
                      <datalist id='orgs'>
                        {orgs}
                      </datalist>
                    </FormGroup>
                  </Col>
                )
              }
              {
                (search_type.value == 'club' || search_type.value == 'member') && (
                <Col xl="2" lg="3" md="4" sm="6" xs="12">
                  <FormGroup>
                    <Select
                      name="search_org"
                      classNamePrefix="react-select-lg"
                      placeholder="Regional Federation"
                      // isMulti
                      value={search_org}
                      options={org_list}
                      getOptionValue={option => option.id}
                      getOptionLabel={option => option.name_o}
                      onChange={(org) => {
                        this.handleSearchFilter('search_org', org);
                      }}
                    />
                  </FormGroup>
                </Col>
                )
              }
              {
                search_type.value == 'club' && (
                  <Col xl="2" lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Input
                        className="club-list"
                        list="clubs"
                        name="search_name"
                        type="text"
                        value={search_name}
                        placeholder="Club Name"
                        onChange={event => this.handleSearchFilter('search_name', event.target.value)}
                      />
                      <datalist id='clubs'>
                        {clubs}
                      </datalist>
                    </FormGroup>
                  </Col>
                )
              }
              {
                search_type.value == 'member' && (
                  <Col xl="2" lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        name="member_type"
                        classNamePrefix={!member_required ? 'invalid react-select-lg' : 'react-select-lg'}
                        placeholder="Member Type"
                        classNamePrefix="react-select-lg"
                        value={member_type}
                        options={member_type_options}
                        getOptionValue={option => option.value}
                        getOptionLabel={option => option.label}
                        onChange={(type) => {
                          this.handleSearchFilter('member_type', type);
                        }}
                      />
                      {
                        !member_required && (
                          <FormFeedback className="d-block">{errors.required}</FormFeedback>
                        )
                      }
                    </FormGroup>
                  </Col>                  
                )
              }
              {
                search_type.value == 'member' && member_type.value == 'player' && (
                  <Fragment>
                    <Col xl="2" lg="2" md="3" sm="6" xs="12">
                      <FormGroup>
                        <Select
                          name="search_gender"
                          classNamePrefix="react-select-lg"
                          placeholder="Gender"
                          value={search_gender}
                          options={search_genders}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          onChange={(gender) => {
                            this.handleSearchFilter('search_gender', gender);
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col xl="2" lg="2" md="3" sm="6" xs="12">
                      <FormGroup>
                        <Select
                          name="search_weight"
                          classNamePrefix="react-select-lg"
                          placeholder="Weight"
                          // isMulti
                          value={search_weight}
                          options={this.getWeights(search_gender ? search_gender.value : '')}
                          getOptionValue={option => option.id}
                          getOptionLabel=
                            {option => option.weight + "Kg"}
                          onChange={(weight) => {
                            this.handleSearchFilter('search_weight', weight);
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col xl="1" lg="2" md="2" sm="6" xs="12">
                      <FormGroup>
                        <Select
                          name="search_dan"
                          classNamePrefix="react-select-lg"
                          placeholder="Dan"
                          // isMulti
                          value={search_dan}
                          options={Dans}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          onChange={(dan) => {
                            this.handleSearchFilter('search_dan', dan);
                          }}
                        />
                      </FormGroup>
                    </Col>
                  </Fragment>
                )
              }
              <Col xl="1" lg="3" md="4" sm="6" xs="12">
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
            search_data && search_data.length == 0 && (
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
                    stype={search_type}
                    mtype={member_type}
                    items={search_data}
                    onEdit={this.handleEdit.bind(this)}
                    onDelete={this.handleDelete.bind(this)}
                    onSelect={this.handleSelectItem.bind(this)}
                  />
                </div>
              </Container>
            )
          }
          { isOpenDeleteModal && <Prompt title={confirmationMessage} id={this.state.deleteId} handleAccept={this.handleDeleteMember} handleCancel={this.handleConfirmationClose} /> }
          {
            isOpenEditModal && (
            <EditModal
              id={edit_item}
              type={search_type}
              weights={weights}
              orgs={org_list}
              roles={roles}
              errors={errors}
              handleSave={this.handleSaveItem}
              handleCancel={this.handleEdit.bind(this)}
            />
            )
          }
        </div>
      </Fragment>
    )
  }
}

export default withRouter(Dashboard);
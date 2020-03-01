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
  import EditModal from '../../components/EditModal';
  import { Dans, search_genders, search_type_options, member_type_options } from '../../configs/data';

  class Dashboard extends Component {
    constructor(props) {
      super(props);

      this.state = {
        org_list: [],
        weights: [],
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
        errors: {
          required: 'This field is required!'
        }
      };

      this.handleSearchFilter = this.handleSearchFilter.bind(this);
      this.handleDeleteMember = this.handleDeleteMember.bind(this);
      this.handleConfirmationClose = this.handleConfirmationClose.bind(this);
      this.handleSaveItem = this.handleSaveItem.bind(this);
      this.getWeights = this.getWeights.bind(this);
    }

    componentDidMount() {
      this.componentWillReceiveProps(this.props);
    }

    async componentWillReceiveProps() {
      const org_response = await Api.get('organizations-list');
      const { response, body } = org_response;
      switch (response.status) {
        case 200:
          this.setState({
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
            this.setState({
              search_org: value,
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
        gender: search_gender ? search_gender.value : '',
        weight: search_weight ? search_weight.id : '',
        dan: search_dan ? search_dan.value : ''
      }

      if (search_type) {
        if (search_type.value == 'member' && !member_type) {
          this.setState({
            member_required: false,
          });
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
      } else {
        this.setState({
          search_required: false,
        });
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

    handleDelete() {

    }

    handleSelectItem(id) {
      const { search_type } = this.state;
      if (search_type.value === 'member') {
        this.props.history.push('/member/detail', id);
      } else {
        this.props.history.push('/organization/detail', id);
      }
    }

    handleDeleteMember() {

    }

    handleConfirmationClose() {

    }

    handleSaveItem() {

    }

    getWeights(gender) {
      return this.state.weights.filter(weight => {
        if (gender === 2) {
          return true;
        } else {
          return weight.gender === gender;
        }
      })
    }

    render() {
      const {
        org_list,
        search_type,
        member_type,
        weights,
        search_org,
        search_name,
        search_gender,
        search_weight,
        search_dan,
        search_required,
        member_required,
        search_data,
        errors,
      } = this.state;
      
      return (
        <Fragment>
          <MainTopBar />
          <div className="main-content dashboard">
            <Container fluid>
              <h3 className="text-danger text-center mb-5">Welcome to National Sports Federation Management System!</h3>
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
                  (search_type.value === 'club' || search_type.value === 'member') && (
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
                  search_type.value === 'club' && (
                    <Col xl="2" lg="3" md="4" sm="6" xs="12">
                      <FormGroup>
                        <Input
                          name="search_name"
                          type="text"
                          value={search_name}
                          placeholder="Club Name"
                          onChange={event => this.handleSearchFilter('search_name', event.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  )
                }
                {
                  search_type.value === 'member' && (
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
                  search_type.value === 'member' && member_type.value === 'player' && (
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
          </div>
        </Fragment>
      )
    }
  }

  export default withRouter(Dashboard);
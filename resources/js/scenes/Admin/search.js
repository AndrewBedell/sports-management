/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import { 
  Container, Row, Col,
  FormGroup, FormFeedback, Button
} from 'reactstrap';
import { Input } from 'semantic-ui-react';
import Select from 'react-select';
import QueryString from 'qs';
import Api from '../../apis/app';

import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import DataTable from '../../components/DataTable';
import {
  Dans, search_genders, search_type_options, member_type_options, referee_type_options
} from '../../configs/data';

class Search extends Component {
  constructor(props) {
    super(props);

    if (referee_type_options.length == 3) referee_type_options.splice(0, 0, { label: 'All Referee', value: 'all' });

    this.state = {
      nf_id: '',
      nf: [],
      orgs: [],
      org_list: [],
      original_clubs: [],
      clubs: [],
      weights: [],
      member_type: '',
      referee_type: referee_type_options[0],
      search_required: true,
      member_required: true,
      search_type: '',
      search_name: '',
      search_org: '',
      search_gender: search_genders[0],
      search_weight: '',
      search_dan: '',
      search_data: null,
      errors: {
        required: 'This field is required!'
      }
    }

    this.handleSearchFilter = this.handleSearchFilter.bind(this);
    this.search = this.search.bind(this);
    this.getWeights = this.getWeights.bind(this);
  }

  async componentDidMount() {
    this.setState({
      nf_id: JSON.parse(localStorage.getItem('nf_id'))
    });

    const nf = await Api.get(`organization/${JSON.parse(localStorage.getItem('nf_id'))}`);

    switch (nf.response.status) {
      case 200:
        this.setState({
          nf: nf.body
        });
        break;
      default:
        break;
    }

    this.componentWillReceiveProps();
  }

  async componentWillReceiveProps() {
    const org_response = await Api.get(`organization-child/${this.state.nf_id}`);
    const { response, body } = org_response;
    switch (response.status) {
      case 200:
        const orgArr = [];
        const data = [];

        orgArr.push(this.state.nf.name_o);
        data.push(this.state.nf);

        for (let i = 0; i < body.filter(item => item.is_club == 0).length; i++) {
          orgArr.push(body[i].name_o);
          data.push(body[i]);
        }
        
        const orgList = orgArr.map((org, Index) => <option key={Index} value={org} />);

        const clubArr = [];
        const club_list1 = await Api.get(`organization-child/${this.state.nf_id}`);
        switch (club_list1.response.status) {
          case 200:
            for (let i = 0; i < club_list1.body.length; i++) {
              if (club_list1.body[i].is_club == 1) {
                clubArr.push({ id: club_list1.body[i].parent_id, value: club_list1.body[i].name_o });
              } else {
                const club_list2 = await Api.get(`organization-child/${club_list1.body[i].id}`);
                
                switch (club_list2.response.status) {
                  case 200:
                    for (let j = 0; j < club_list2.body.length; j++) {
                      clubArr.push({ id: club_list2.body[i].parent_id, value: club_list2.body[i].name_o });
                    }
                    break;
                  default:
                    break;
                }
              }
            }
            break;
          default:
            break;
        }
        
        this.setState({
          orgs: orgList,
          org_list: data,
          original_clubs: clubArr,
          clubs: clubArr.map((club, Index) => <option key={Index} id={club.id} value={club.value} />)
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

    const search = QueryString.parse(this.props.location.search, { ignoreQueryPrefix: true });

    this.setState({
      search_type: search.stype ? (search_type_options.find(type => type.value == search.stype) || '') : '',
      search_org: search.org ? (org_response.body.find(org => org.id == search.org) || '') : '',
      search_name: search.name || '',
      member_type: search.mtype ? (member_type_options.find(option => option.value == search.mtype) || '') : '',
      referee_type: search.rtype 
        ? (referee_type_options.find(option => option.value == search.rtype) || referee_type_options[0]) 
        : referee_type_options[0],
      search_gender: search.gender
        ? (search_genders.find(gender => gender.value == search.gender) || search_genders[0])
        : search_genders[0],
      search_weight: search.weight ? (weight_list.body.find(weight => weight.id == search.weight) || '') : '',
      search_dan: search.dan ? (Dans.find(dan => dan.value == search.dan) || '') : '',
      search_data: null
    });

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
        let filtered = [];

        if (value == null) {
          filtered = this.state.original_clubs.map((club, Index) => <option key={Index} id={club.id} value={club.value} />);
        } else {
          filtered = this.state.original_clubs.filter(club => club.id == value.id).map((club, Index) => <option key={Index} id={club.id} value={club.value} />);
        }

        const clubsFiltered = filtered;

        this.setState({
          search_org: value,
          clubs: clubsFiltered,
          search_name: '',
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
      case 'referee_type':
        this.setState({
          referee_type: value,
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
      search_type, search_org, search_name, member_type, referee_type, search_gender, search_weight, search_dan
    } = this.state;

    const search_params = {
      item: this.state.nf_id,
      stype: search_type ? search_type.value : '',
      org: search_org ? search_org.id : '',
      name: search_name,
      mtype: member_type ? member_type.value : '',
      rtype: referee_type ? referee_type.value : '',
      gender: search_gender ? search_gender.value : search_genders[0],
      weight: search_weight && search_weight.id && search_weight.weight !== 'All' ? search_weight.id : '',
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
        member_required: false
      });
      return;
    }

    this.props.history.push(`/admin/search${QueryString.stringify(search_params, { addQueryPrefix: true })}`);
  }

  async search(search_params) {
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

  getWeights(gender) {
    return this.state.weights.filter((weight) => {
      if (`${gender}` == '0') {
        return true;
      }
      return `${weight.gender}` == `${gender}`;
    });
  }

  render() {
    const { 
      nf,
      orgs,
      org_list,
      clubs,
      search_required,
      member_required,
      search_type,
      search_name,
      search_org,
      search_gender,
      search_weight,
      search_dan,
      member_type,
      referee_type,
      search_data,
      errors
    } = this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <div className="content">
              <Container fluid>
                <h3 className="text-danger text-center my-3">
                  Welcome to { nf.name_o }
                </h3>

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
                            placeholder="Organization Name"
                            onChange={event => this.handleSearchFilter('search_name', event.target.value)}
                          />
                          <datalist id="orgs">
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
                            placeholder="Org Search"
                            isClearable
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
                    (search_type.value == 'club' || search_type.value == 'member') && (
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
                          <datalist id="clubs">
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
                    search_type.value == 'member' && member_type.value == 'referee' && (
                      <Col xl="2" lg="3" md="4" sm="6" xs="12">
                        <FormGroup>
                          <Select
                            name="referee_type"
                            classNamePrefix="react-select-lg"
                            placeholder="Referee Type"
                            value={referee_type}
                            options={referee_type_options}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(type) => {
                              this.handleSearchFilter('referee_type', type);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    )
                  }
                  {
                    search_type.value == 'member' && member_type.value == 'judoka' && (
                      <Fragment>
                        <Col xl="2" lg="2" md="4" sm="6" xs="12">
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
                              getOptionLabel={option => `${option.weight} Kg`}
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
                        display={false}
                      />
                    </div>
                  </Container>
                )
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Search);
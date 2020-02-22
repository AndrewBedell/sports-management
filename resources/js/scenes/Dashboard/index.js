/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import Select from 'react-select';
import {
  Container, Row, Col, FormGroup, Button, Input, FormFeedback
} from 'reactstrap';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search_type_options: [
        { label: 'Organization', value: 'org' },
        { label: 'Club', value: 'club' },
        { label: 'Player', value: 'player' }
      ],
      orgs: [],
      weights: [],
      dans: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' },
        { value: 6, label: '6' },
        { value: 7, label: '7' },
        { value: 8, label: '8' },
        { value: 9, label: '9' },
        { value: 10, label: '10' }
      ],
      search_required: true,
      search_type: '',
      search_orgs: [],
      search_name: '',
      search_weight: [],
      search_dan: [],
      error: {
        search_type: 'This field is required!'
      },
      search_data: null
    };
    this.handleSearchFilter = this.handleSearchFilter.bind(this);
  }

  async componentDidMount() {
    const org_response = await Api.get('organizations-list');
    const { response, body } = org_response;
    switch (response.status) {
      case 200:
        this.setState({
          orgs: body
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
      case 'type':
        this.setState({
          search_type: value,
          search_required: true
        });
        break;
      case 'orgs':
        this.setState({
          search_orgs: value
        });
        break;
      case 'name':
        this.setState({
          search_name: value
        });
        break;
      case 'weight':
        this.setState({
          search_weight: value
        });
        break;
      case 'dan':
        this.setState({
          search_dan: value
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

  render() {
    const {
      orgs,
      weights,
      dans,
      search_type_options,
      search_type,
      search_orgs,
      search_name,
      search_weight,
      search_dan,
      search_required,
      error,
      search_data
    } = this.state;
    console.log(search_data);
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container fluid>
            <h3 className="text-danger text-center mb-5">Welcome to National Sports Federation Management System!</h3>
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
                    options={orgs}
                    getOptionValue={option => option.id}
                    getOptionLabel={option => option.label}
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
              <Col xl="2" lg="3" md="4" sm="6" xs="12">
                {
                  search_type.value === 'player' && (
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
                  )
                }
              </Col>
              <Col xl="2" lg="3" md="4" sm="6" xs="12">
                {
                  search_type.value === 'player' && (
                    <FormGroup>
                      <Select
                        name="dan"
                        classNamePrefix="react-select-lg"
                        placeholder="Search Dan"
                        isMulti
                        value={search_dan}
                        options={dans}
                        getOptionValue={option => option.value}
                        getOptionLabel={option => option.label}
                        onChange={(dan) => {
                          this.handleSearchFilter('dan', dan);
                        }}
                      />
                    </FormGroup>
                  )
                }
              </Col>
            </Row>
          </Container>
          <Container >

          </Container>
        </div>
      </Fragment>
    );
  }
}

export default Dashboard;

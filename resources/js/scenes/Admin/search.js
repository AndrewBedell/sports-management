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
  FormGroup
} from 'reactstrap';
import { Input } from 'semantic-ui-react';
import Select from 'react-select';
import Api from '../../apis/app';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import {
  Dans, search_genders, search_type_options, member_type_options, referee_type_options
} from '../../configs/data';

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nf_id: props.history.location.state,
      nf: [],
      orgs: [],
      org_list: [],
      original_clubs: [],
      clubs: [],
      search_required: true,
      search_type: '',
      search_name: '',
      search_org: ''
    }
  }

  async componentDidMount() {
    const nf = await Api.get(`organization/${this.state.nf_id}`);
    const { response, body } = nf;

    switch (response.status) {
      case 200:
        this.setState({
          nf: body
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
                
                switch (club_list1.response.status) {
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

  render() {
    const { 
      nf,
      orgs,
      org_list,
      clubs,
      search_required,
      search_type,
      search_name,
      search_org
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
                </Row>
              </Container>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Search);
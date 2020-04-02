import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, 
  FormGroup,
  Alert, Button
} from 'reactstrap';
import { Segment } from 'semantic-ui-react';
import Select from 'react-select';

import Api from '../../apis/app';

import Prompt from '../../components/Prompt';
import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionClubTable from '../../components/CompetitionClubTable';
import CompetitionSelectTable from '../../components/CompetitionSelectTable';
import { Dans, search_genders, member_type_options } from '../../configs/data';

class CompetitionInscribe extends Component {
  constructor(props) {
    super(props);

    this.state = {
      competition_id: '',
      competition: [],
      org_list: [],
      club_list: [],
      org_original: [],
      club_original: [],
      clubs: [],
      editClub: [],
      editMembers: [],
      addMembers: [],
      edit: false,
      deleteId: '',
      deleteOption: '',
      isOpenDeleteModal: false,
      alertVisible: false,
      confirmationMessage: '',
      successMessage: '',
      org_val: null,
      club_val: null,
      member_val: null,
      role_name: '',
      gender: '',
      weight: '',
      dan: '',
      pageSize: 5,
      data: [],
      skip: 0,
      flagClub: false,
      flagMember: false,
      weights: [],
      weightsCopy: []
    };
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const is_nf = user.user.is_nf;
    const club_member = user.user.is_club_member;
    const user_org = user.user.member_info.organization_id;

    const competition_id = this.props.location.state;

    this.setState({
      competition_id
    });

    const orgs = await Api.get(`competition-orgs/${competition_id}`);
    switch (orgs.response.status) {
      case 200:
        if (orgs.body.regs.length > 0 && orgs.body.regs[0].parent_id == 0)
          orgs.body.regs[0].name_o = "National Federation";

        this.setState({
          org_list: orgs.body.regs,
          org_original: orgs.body.regs,
          club_list: orgs.body.clubs,
          club_original: orgs.body.clubs
        });
        break;
      default:
        break;
    }

    const weight_list = await Api.get('weights');
    switch (weight_list.response.status) {
      case 200:
        this.setState({
          weights: weight_list.body,
          weightsCopy: weight_list.body
        });
        break;
      default:
        break;
    }

    const data = await Api.get(`competition/${competition_id}`);
    switch (data.response.status) {
      case 200:
        this.setState({
          competition: data.body.competition
        });
        break;
      default:
        break;
    }

    const clubs = await Api.get(`competition-clubs/${competition_id}`);
    switch (clubs.response.status) {
      case 200:
        this.setState({
          clubs: clubs.body.result
        });
        break;
      default:
        break;
    }
  }

  handleChange(type, value) {
    const { org_original, club_original } = this.state;

    if (type == 'org') {
      let filtered = [];

      if (value == null) {
        filtered = club_original
      } else {
        filtered = club_original.filter(club => club.parent_id == value.id)
      }
      
      this.setState({
        club_list: filtered,
        org_val: value,
        club_val: null
      });
    }

    if (type == 'club') {
      if (value == null) {
        this.setState({
          club_list: club_original,
          org_val: null,
          club_val: value
        });
      } else {
        let filtered = org_original.filter(org => org.id == value.parent_id);

        this.setState({
          org_val: filtered[0],
          club_val: value
        });
      }
    }
  }

  flagAddClub() {
    this.setState({
      flagClub: true
    });
  }

  async handleAddClub() {
    const { org_val, club_val } = this.state;

    if (org_val && club_val) {
      let params = [];

      params.competition_id = this.state.competition_id;
      params.reg_id = org_val.id;
      params.club_id = club_val.id;

      const data = await Api.post('add-club-competition', params);
      switch (data.response.status) {
        case 200:
          if (data.body.regs.length > 0 && data.body.regs[0].parent_id == 0)
            data.body.regs[0].name_o = "National Federation";

          this.setState({
            alertVisible: true,
            messageStatus: true,
            isOpenDeleteModal: false,
            successMessage: data.body.message,
            clubs: data.body.result,
            org_list: data.body.regs,
            org_original: data.body.regs,
            club_list: data.body.clubs,
            club_original: data.body.clubs,
            org_val: null,
            club_val: null
          });
          break;
        default:
          break;
      }

      setTimeout(() => {
        this.setState({ alertVisible: false });
      }, 2000);
    }
  }

  async handleSelectClub(club_id, action) {
    const params = {};
    let members = [];

    params.competition_id = this.props.location.state;
    params.club_id = club_id;
    
    const selects = await Api.post('competition-members', params);
    switch (selects.response.status) {
      case 200:
        members = selects.body.data
        break;
      default:
        break;
    }

    if (action == 'edit') {
      const club = await Api.get(`organization/${club_id}`);
      switch (club.response.status) {
        case 200:
          this.setState({
            editClub: club.body
          });
          break;
        default:
          break;
      }

      const addMembers = await Api.post('competition-add-members', params);
      switch (addMembers.response.status) {
        case 200:
          this.setState({
            addMembers: addMembers.body.members,
            addMembersCopy: addMembers.body.members
          });
          break;
        default:
          break;
      }

      this.setState({
        editMembers: members,
        edit: true
      });
    }
  }

  handleDelete(id, option) {
    this.setState({
      isOpenDeleteModal: true,
      deleteId: id,
      deleteOption: option,
      confirmationMessage: 'Are you sure you want to delete this ' + option + ' from competition?'
    });
  }

  async handleDeleteClub(option, id) {
    if (option == 'club') {
      const { clubs } = this.state;
      
      const params = {};

      params.competition_id = this.state.competition_id;
      params.club_id = id;

      const delClub = await Api.delete('competition-club', params);
      switch (delClub.response.status) {
        case 200:
          this.setState({
            alertVisible: true,
            messageStatus: true,
            isOpenDeleteModal: false,
            successMessage: delClub.body.message,
            clubs: clubs.filter(item => item.id !== id)
          });
          break;
        default:
          break;
      }
    }

    if (option == 'member') {
      const { editMembers, editClub } = this.state;

      const params = {};

      params.competition_id = this.state.competition_id;
      params.club_id = editClub.id;
      params.member_id = id;

      const delMember = await Api.delete('competition-member', params);
      switch (delMember.response.status) {
        case 200:
          this.setState({
            alertVisible: true,
            messageStatus: true,
            isOpenDeleteModal: false,
            successMessage: delMember.body.message,
            editMembers: editMembers.filter(member => member.id != id)
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

  handleConfirmClose() {
    this.setState({
      isOpenDeleteModal: false,
      confirmationMessage: ''
    });
  }

  handleChangeMember(option, type) {
    const { addMembersCopy, weightsCopy } = this.state;

    let addMembers = addMembersCopy;
    let weights = weightsCopy;
    
    let { role_name, member_val, gender, weight, dan } = this.state;

    if (option == null) {
      switch (type) {        
        case 'type':
          role_name = '';
          member_val = '';
          break;
        case 'member':
          member_val = '';
          gender = '';
          weight = '';
          dan = '';
          break;
        case 'gender':
          gender = '';
          break;
        case 'weight':
          weight = '';
          break;
        case 'dan':
          dan = '';
        default:
          break;
      }
    } else {
      switch (type) {        
        case 'type':
          role_name = option;
          member_val = '';
          gender = '';
          weight = '';
          dan = '';
          break;
        case 'member':
          member_val = option;
          gender = '';
          weight = '';
          dan = '';
          break;
        case 'gender':
          gender = option;
          break;
        case 'weight':
          weight = option;
          break;
        case 'dan':
          dan = option;
        default:
          break;
      }
    }

    const roleArr = {
      'staff': 1,
      'coach': 2,
      'judoka': 3,
      'referee': 4
    }

    if (role_name != '') {
      addMembers = addMembers.filter(member => member.role_id == roleArr[role_name.value]);
    }

    if (member_val == '') {
      if (gender != '' && gender.value != 0) {
        addMembers = addMembers.filter(member => member.gender == gender.value);
        weights = weightsCopy.filter(weight => weight.gender == gender.value);
      }
  
      if (weight != '') {
        addMembers = addMembers.filter(member => member.weight == weight.weight);
      }
  
      if (dan != '') {
        addMembers = addMembers.filter(member => member.dan == dan.value);
      }

      if (type == 'member') {
        gender = '';
        weight = '';
        dan = '';
        addMembers = addMembersCopy;
      }
    } else {
      role_name = member_type_options.filter(type => roleArr[type.value] == member_val.role_id)[0];
      gender = search_genders.filter(gender => gender.value == member_val.gender)[0];
      weight = weightsCopy.filter(weight => weight.weight == member_val.weight)[0];
      dan = Dans.filter(dan => dan.value == member_val.dan)[0];
    }

    this.setState({
      role_name,
      member_val,
      gender,
      weight,
      dan,
      weights,
      addMembers
    });
  }

  flagAddMember() {
    this.setState({
      flagMember: true
    });
  }

  async handleAddMember() {
    const { member_val, editClub, addMembers } = this.state;
   
    if (member_val != null) {
      let params = [];

      params.competition_id = this.state.competition_id;
      params.club_id = editClub.id;
      params.member_id = member_val.id;

      const data = await Api.post('add-member-competition', params);
      switch (data.response.status) {
        case 200:
          this.setState({
            alertVisible: true,
            messageStatus: true,
            isOpenDeleteModal: false,
            successMessage: data.body.message,
            editMembers: data.body.members,
            addMembers: addMembers.filter(member => member.id != member_val.id),
            addMembersCopy: addMembers.filter(member => member.id != member_val.id),
            member_val: null,
            role_name: '',
            weight: '',
            dan: '',
            position: ''
          });
          break;
        default:
          break;
      }

      setTimeout(() => {
        this.setState({ alertVisible: false });
      }, 2000);
    }
  }

  async handleBack() {
    const competition_id = this.props.location.state;

    const clubs = await Api.get(`competition-clubs/${competition_id}`);
    switch (clubs.response.status) {
      case 200:
        this.setState({
          flagClub: false,
          flagMember: false,
          clubs: clubs.body.result,
          edit: false
        });
        break;
      default:
        break;
    }
  }

  async acceptCompetition() {
    const { competition_id } = this.state;

    const accept = await Api.get(`accept-competition/${competition_id}`);
    switch (accept.response.status) {
      case 200:
        this.setState({
          flagClub: false,
          flagMember: false,
          clubs: accept.body.result,
          edit: false
        });
        break;
      default:
        break;
    }
  }

  render() {
    const {
      competition, clubs, editClub,
      org_list, club_list, org_val, club_val,
      addMembers,
      editMembers, edit,
      isOpenDeleteModal, confirmationMessage, deleteId, deleteOption, successMessage,
      weights, member_val, role_name, gender, weight, dan,
      flagClub, flagMember
    } = this.state;
    
    return (
      <Fragment>
        <MainTopBar />

        { 
          isOpenDeleteModal && 
          <Prompt 
            title={confirmationMessage} 
            id={deleteId}
            handleAccept={this.handleDeleteClub.bind(this, deleteOption)} 
            handleCancel={this.handleConfirmClose.bind(this)} 
          /> 
        }

        <div className="main-content detail">
          <Container>
            <Segment>
              <Row>
                <Col sm="12">
                  <h3 className="text-center text-primary">{competition.name}</h3>
                </Col>
                <Col sm="12" className="mt-5">
                  <h4>Competition Place: {competition.place}</h4>
                </Col>
                <Col sm="12" className="mt-3">
                  <h4>Competition Time: {competition.from} ~ {competition.to}</h4>
                </Col>
                <Col sm="12" className="mt-3">
                  <h4>Federations and Clubs: {competition.reg_ids} Regions, {competition.club_ids} Clubs</h4>
                </Col>
              </Row>
            </Segment>
            <Alert color="success" isOpen={this.state.alertVisible}>{successMessage }</Alert>
            {
              !edit && (
                <Row className="my-3">
                  <Col sm="12" className="text-center">
                    {
                      flagClub ? (
                        <Button
                          type="button"
                          color="secondary"
                          onClick={this.handleAddClub.bind(this)}
                        >
                          Add Club
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          color="secondary"
                          onClick={this.flagAddClub.bind(this)}
                        >
                          <i className="fa fa-plus"></i>
                        </Button>
                      )
                    }
                  </Col>
                </Row>
              )
            }
            {
              !edit && flagClub && (
                <Row>
                  <Col lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        classNamePrefix="react-select-lg"
                        placeholder="Select Region"
                        isClearable
                        value={org_list.length == 1 ? org_list[0] : (org_val && org_val)}
                        options={org_list}
                        getOptionValue={option => option.id}
                        getOptionLabel={option => option.name_o}
                        onChange={(org) => {
                          this.handleChange('org', org);
                        }}
                      />
                    </FormGroup>
                  </Col>
                  <Col lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        classNamePrefix="react-select-lg"
                        placeholder="Select Club"
                        isClearable
                        value={club_val && club_val}
                        options={club_list}
                        getOptionValue={option => option.id}
                        getOptionLabel={option => option.name_o}
                        onChange={(club) => {
                          this.handleChange('club', club);
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )
            }
            {
              !edit && clubs && clubs.length > 0 && (
                <Row>
                  <CompetitionClubTable
                    items={clubs}
                    inscribe
                    onSelect={this.handleSelectClub.bind(this)}
                    onDelete={this.handleDelete.bind(this)}
                  />
                </Row>
              )
            }
          </Container>
          {
            edit && (
              <Container>
                <Segment className="mt-3">
                  <Row>
                    <Col sm="12">
                      <h5>Regional Federation: {editClub.parent}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Club: {editClub.name_o}</h5>
                      <div className="w-100 d-flex justify-content-end">
                        <a className="detail-link mr-4" onClick={this.handleBack.bind(this)}>
                          <i className="fa fa-angle-double-left"></i> Back
                        </a>
                      </div>
                    </Col>
                  </Row>
                </Segment>
                <Row className="my-3">
                  <Col sm="12" className="text-center">
                    {
                      flagMember ? (
                        <Button
                          type="button"
                          color="success"
                          onClick={this.handleAddMember.bind(this)}
                        >
                          Add Member
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          color="success"
                          onClick={this.flagAddMember.bind(this)}
                        >
                          <i className="fa fa-plus"></i>
                        </Button>
                      )
                    }
                  </Col>
                </Row>
                {
                  flagMember && (
                    <Row>
                      <Col md="3" sm="6" xs="12">
                        <FormGroup>
                          <Select
                            classNamePrefix="react-select-lg"
                            placeholder="Member Type"
                            isClearable
                            value={role_name}
                            options={member_type_options}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(option) => {
                              this.handleChangeMember(option, 'type');
                            }}
                          />
                        </FormGroup>
                      
                      </Col>
                      <Col md="3" sm="6" xs="12">
                        <FormGroup>
                          <Select
                            classNamePrefix="react-select-lg"
                            placeholder="Select Member"
                            isClearable
                            value={member_val}
                            options={addMembers}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name + ' ' + option.surname}
                            onChange={(option) => {
                              this.handleChangeMember(option, 'member');
                            }}
                          />
                        </FormGroup>
                      </Col>
                      {
                        role_name.value == 'judoka' && (
                          <Fragment>
                            <Col xl="2" lg="2" md="4" sm="6" xs="12">
                              <FormGroup>
                                <Select
                                  name="search_gender"
                                  classNamePrefix="react-select-lg"
                                  placeholder="Gender"
                                  value={gender}
                                  options={search_genders}
                                  getOptionValue={option => option.value}
                                  getOptionLabel={option => option.label}
                                  onChange={(option) => {
                                    this.handleChangeMember(option, 'gender');
                                  }}
                                />
                              </FormGroup>
                            </Col>
                            <Col xl="2" lg="2" md="4" sm="6" xs="12">
                              <FormGroup>
                                <Select
                                  classNamePrefix="react-select-lg"
                                  placeholder="Weight"
                                  isClearable
                                  value={weight}
                                  options={weights}
                                  getOptionValue={option => option.id}
                                  getOptionLabel={
                                    option => option.weight != 'All' ? option.weight + ' Kg' : 'All Weights'
                                  }
                                  onChange={(option) => {
                                    this.handleChangeMember(option, 'weight');
                                  }}
                                />
                              </FormGroup>
                            </Col>
                            <Col xl="2" lg="2" md="4" sm="6" xs="12">
                              <FormGroup>
                                <Select
                                  classNamePrefix="react-select-lg"
                                  placeholder="Dans"
                                  isClearable
                                  value={dan}
                                  options={Dans}
                                  getOptionValue={option => option.value}
                                  getOptionLabel={option => option.label}
                                  onChange={(option) => {
                                    this.handleChangeMember(option, 'dan');
                                  }}
                                />
                              </FormGroup>
                            </Col>
                          </Fragment>
                        )
                      }
                    </Row>
                  )
                }
                {
                  editMembers.length > 0 && (
                    <Row>
                      <Col sm="12" className="table-responsive">
                        <CompetitionSelectTable
                          items={editMembers}
                          delCol
                          onDelete={this.handleDelete.bind(this)}
                        />
                      </Col>
                    </Row>
                  )
                }
              </Container>
            )
          }
          {
            clubs.filter(club => club.status == 0).length > 0 && (
              <Container>
                <Row className="mt-3">
                  <Col sm="12" className="text-center">
                    <Button
                      type="button"
                      color="success"
                      onClick={this.acceptCompetition.bind(this)}
                    >
                      <i className="fa fa-check"></i> Accept
                    </Button>
                  </Col>
                </Row>
              </Container>
            )
          }
        </div>
      </Fragment>
    );
  }
}

class cellWithBackGround extends React.Component {
  render() {
    let backgroundColor = "";
    let color = "rgb(0, 0, 0)";
    let textAlign = "center"

    switch (this.props.dataItem.Category) {
      case 'DELEGATION':
        backgroundColor = "rgb(141, 248, 80)";
        color = "rgb(255, 255, 255)";
        break;
      case 'Seniors Male':
        backgroundColor = "rgb(196, 218, 255)";
        color = "rgb(255, 255, 255)";
        break;
      case 'Seniors Female':
        backgroundColor = "rgb(238, 198, 190)";
        color = "rgb(255, 255, 255)";
        break;
      default:
        break;
    }

    const style = { 
      backgroundColor,
      color,
      textAlign,
      border: '1px solild red'
    };

    return (
        <td style={style}>
            {this.props.dataItem[this.props.field]}
        </td>
    );
  }
}

export default CompetitionInscribe;
import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, 
  FormGroup,
  Alert, Button, Input
} from 'reactstrap';
import { Segment } from 'semantic-ui-react';
import Select from 'react-select';

import { Grid, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { GridPDFExport } from '@progress/kendo-react-pdf';

import Api from '../../apis/app';

import Prompt from '../../components/Prompt';
import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionClubTable from '../../components/CompetitionClubTable';
import CompetitionSelectTable from '../../components/CompetitionSelectTable';

class CompetitionDetail extends Component {
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
      selectMembers: [],
      exportMembers: [],
      addMembers: [],
      edit: false,
      detail: false,
      exportPDF: false,
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
      weight: '',
      dan: '',
      position: '',
      pageSize: 5,
      data: [],
      skip: 0
    };
  }

  async componentDidMount() {
    const competition_id = this.props.location.state;
    this.setState({
      competition_id
    });

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

    params.competition_id = this.state.competition_id;
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
            addMembers: addMembers.body.members
          });
          break;
        default:
          break;
      }

      this.setState({
        editMembers: members,
        edit: true,
        detail: false,
        exportPDF: false
      });
    }

    if (action == 'detail') {
      this.setState({
        selectMembers: members,
        edit: false,
        detail: true,
        exportPDF: false
      });
    }

    if (action == 'export') {
      let exportMembers = [];
      for (var i = 0; i < members.length; i++) {
        let arr = {
          "Name": members[i].surname + members[i].name,
          "Role": members[i].role_name,
          "Gender": members[i].gender == 1 ? 'Male' : 'Female',
          "Birthday": members[i].birthday,
          "Weight": members[i].weight + ' Kg',
          "Dan": members[i].dan
        }

        exportMembers.push(arr);
      }
      
      this.setState({
        exportMembers,
        edit: false,
        detail: false,
        exportPDF: true,
        data: exportMembers.slice(0, this.state.pageSize)
      });
    }

    if (action == 'accept') {
      const accept = await Api.post('accept-competition', params);
      switch (accept.response.status) {
        case 200:
          this.setState({
            clubs: accept.body.result
          });
          break;
        default:
          break;
      }
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

  handleChangeMember(member) {
    if (member == null) {
      this.setState({
        role_name: '',
        weight: '',
        dan: '',
        position: ''
      });
    } else {
      const role_id = member.role_id;
      let role_name = '';

      switch (role_id) {
        case 1:
          role_name = 'Officer';
          break;
        case 2:
          role_name = 'Coach';
          break;
        case 3:
          role_name ='Judoka';
          break;
        case 4:
          role_name = 'Referee'
          break;
        default:
          break;
      }

      this.setState({
        member_val: member,
        role_name,
        weight: member.weight,
        dan: member.dan,
        position: member.position
      });
    }
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
            addMembers: addMembers.filter(member => member.id != member_val),
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
          clubs: clubs.body.result,
          edit: false,
          detail: false,
          exportPDF: false
        });
        break;
      default:
        break;
    }
  }

  pageChange(event) {
    let skip = event.page.skip;
    let take = event.page.take;

    this.setState({
      data: this.state.exportMembers.slice(skip, skip + take),
      skip
    });
  }

  exportPDF() {
    this.gridPDFExport.save(this.state.exportMembers);
  }

  render() {
    const { 
      competition, clubs, editClub,
      org_list, club_list, org_val, club_val,
      addMembers,
      editMembers, edit,
      selectMembers, detail,
      exportMembers, exportPDF,
      isOpenDeleteModal, confirmationMessage, deleteId, deleteOption, successMessage,
      member_val, role_name, weight, dan, position,
      pageSize, data, skip
    } = this.state;

    const grid = (
      <Grid
          total={exportMembers.length}
          pageSize={pageSize}
          onPageChange={this.pageChange.bind(this)}
          data={data}
          skip={skip}
          pageable={true}
          style={{ maxHeight: '490px' }}
      >
          <GridToolbar>
            <button
                title="Export PDF"
                className="k-button k-primary"
                onClick={this.exportPDF.bind(this)}
            >
                Export PDF
            </button>
          </GridToolbar>

          <GridColumn headerClassName="text-center" field="Name" title="Name" width="300px" />
          <GridColumn headerClassName="text-center" className="text-center" field="Role" title="Role" />
          <GridColumn headerClassName="text-center" className="text-center" field="Gender" title="Gender" />
          <GridColumn headerClassName="text-center" className="text-center" field="Birthday" title="Birthday" width="150px" />
          <GridColumn headerClassName="text-center" className="text-center" field="Weight" title="Weight" />
          <GridColumn headerClassName="text-center" className="text-center" field="Dan" title="Dan" />
      </Grid>
    );

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
              !edit && clubs && clubs.length > 0 && (
                <Row className="mt-5">
                  <Col xl="2" lg="3" md="4" sm="6" xs="12">
                    <FormGroup>
                      <Select
                        classNamePrefix="react-select-lg"
                        placeholder="Select Region"
                        isClearable
                        value={org_val && org_val}
                        options={org_list}
                        getOptionValue={option => option.id}
                        getOptionLabel={option => option.name_o}
                        onChange={(org) => {
                          this.handleChange('org', org);
                        }}
                      />
                    </FormGroup>
                  </Col>
                  <Col xl="2" lg="3" md="4" sm="6" xs="12">
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
                  <Col xl="2" lg="3" md="4" sm="6" xs="12">
                    <Button
                      type="button"
                      color="secondary"
                      onClick={this.handleAddClub.bind(this)}
                    >
                      Add Club
                    </Button>
                  </Col>
                </Row>
              )
            }
            {
              !edit && clubs && clubs.length > 0 && (
                <Row className="mt-3">
                  <CompetitionClubTable
                    items={clubs}
                    onSelect={this.handleSelectClub.bind(this)}
                    onDelete={this.handleDelete.bind(this)}
                  />
                </Row>
              )
            }
            {
              detail && selectMembers && selectMembers.length > 0 && (
                <Row className="mt-3">
                  <CompetitionSelectTable
                    items={selectMembers}
                  />
                </Row>
              )
            }
            {
              exportPDF && (
                <Row className="mt-3">
                  {grid}
                  <GridPDFExport
                    paperSize="A4"
                    margin={{ top: 60, left: 30, right: 30, bottom: 30 }}
                    landscape={true}
                    ref={pdfExport => this.gridPDFExport = pdfExport}
                  >
                    {grid}
                  </GridPDFExport>
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
                {
                  editMembers.length > 0 && (
                    <Fragment>
                      <Row className="mt-3">
                        <Col md="4" sm="6" xs="12">
                          <FormGroup>
                            <Select
                              classNamePrefix="react-select-lg"
                              placeholder="Select Member"
                              isClearable
                              value={member_val}
                              options={addMembers}
                              getOptionValue={option => option.id}
                              getOptionLabel={option => option.name + ' ' + option.surname}
                              onChange={(member) => {
                                this.handleChangeMember(member);
                              }}
                            />
                          </FormGroup>
                        </Col>
                        {
                          role_name && role_name != '' && (
                            <Col md="2" sm="3" xs="6">
                              <Input type="text" value={role_name} readOnly />
                            </Col>
                          )
                        }
                        {
                          weight && weight != '' && (
                            <Col md="2" sm="3" xs="6">
                              <Input type="text" value={weight + ' Kg'} readOnly />
                            </Col>
                          )
                        }                        
                        {
                          dan && dan != '' && (
                            <Col md="2" sm="3" xs="6">
                              <Input type="text" value={dan} readOnly />
                            </Col>
                          )
                        }
                        {
                          position && role_name && role_name != 'Judoka' && (
                            <Col md="2" sm="3" xs="6">
                              <Input type="text" value={position} readOnly />
                            </Col>
                          )
                        }
                        <Col md="2" sm="3" xs="6">
                          <Button
                            type="button"
                            color="success"
                            onClick={this.handleAddMember.bind(this)}
                          >
                            Add Member
                          </Button>
                        </Col>
                      </Row>
                      <Row className="mt-2">
                        <Col sm="12" className="table-responsive">
                          <CompetitionSelectTable
                            items={editMembers}
                            delCol
                            onDelete={this.handleDelete.bind(this)}
                          />
                        </Col>
                      </Row>
                    </Fragment>
                  )
                }
              </Container>
            )
          }
        </div>
      </Fragment>
    );
  }
}

export default CompetitionDetail;
import React, { Component, Fragment } from 'react';
import { 
  PDFViewer , Page, Text, View, Document, StyleSheet, 
} from '@react-pdf/renderer';
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

class CompetitionDetail extends Component {
  constructor(props) {
    super(props);

    const styles = StyleSheet.create({
      page: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF'
      },
      title: {
        color: 'blue',
        flexGrow: 1,
        fontSize: 20,
        margin: 30,
        padding: 10,
        textAlign: 'center'
      },
      element: {
        border: '1px solid black',
        color: 'black',
        flexGrow: 1,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginHorizontal: 10,
        padding: 10,
      }
    });

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
      styles,
      deleteId: '',
      deleteOption: '',
      isOpenDeleteModal: false,
      alertVisible: false,
      confirmationMessage: '',
      successMessage: '',
      org_val: null,
      club_val: null
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

      const data = await Api.post('add-competition', params);
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
          // console.log(addMembers.body.members);
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
      this.setState({
        exportMembers: members,
        edit: false,
        detail: false,
        exportPDF: true
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
            editMembers: editMembers.filter(member => member.id != id),
            clubs: delMember.body.result
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

  handleBack() {
    this.setState({
      edit: false,
      detail: false,
      exportPDF: false
    });
  }

  render() {
    const { 
      competition, clubs, editClub,
      org_list, club_list, org_val, club_val,
      editMembers, edit,
      selectMembers, detail,
      exportMembers, exportPDF, styles,
      isOpenDeleteModal, confirmationMessage, deleteId, deleteOption, successMessage
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
                    name="search_club"
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
            <Alert color="success" isOpen={this.state.alertVisible}>{successMessage }</Alert>
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
                <PDFViewer>
                  <Document>
                    <Page size="A4" style={styles.page}>
                      <View style={styles.title}>
                        <Text>Competition Members</Text>
                      </View>
                      <View style={styles.element}>
                        {
                          exportMembers.map((item, index) => (
                            <View key={index}  style={styles.row}>
                              <Text>{item.name} {item.surname}</Text>
                              <Text>{item.birthday}</Text>
                            </View>
                          ))
                        }
                      </View>
                    </Page>
                  </Document>
                </PDFViewer>
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
                    // <Row className="mt-2">
                    //   <Col sm="3">
                        
                    //   </Col>
                    // </Row>
                    <Row className="mt-2">
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
        </div>
      </Fragment>
    );
  }
}

export default CompetitionDetail;
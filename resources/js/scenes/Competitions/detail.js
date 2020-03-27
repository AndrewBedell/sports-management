import React, { Component, Fragment } from 'react';
import { 
  PDFViewer , Page, Text, View, Document, StyleSheet, 
} from '@react-pdf/renderer';
import {
  Container, Row, Col, Alert
} from 'reactstrap';
import { Segment } from 'semantic-ui-react';
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
      clubs: [],
      editClub: [],
      editMembers: [],
      selectMembers: [],
      exportMembers: [],
      edit: false,
      detail: false,
      exportPDF: false,
      styles,
      deleteId: '',
      isOpenDeleteModal: false,
      alertVisible: false,
      confirmationMessage: '',
      successMessage: ''
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

  handleDelete(id) {
    this.setState({
      isOpenDeleteModal: true,
      deleteId: id,
      confirmationMessage: `Are you sure you want to delete this club from competition?`
    });
  }

  async handleDeleteClub(club_id) {
    const { clubs } = this.state;
    
    const params = {};

    params.competition_id = this.state.competition_id;
    params.club_id = club_id;

    const delClub = await Api.delete('competition-club', params);
    switch (delClub.response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          isOpenDeleteModal: false,
          successMessage: delClub.body.message,
          clubs: clubs.filter(item => item.id !== club_id)
        });
        break;
      default:
        break;
    }
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
      editMembers, edit,
      selectMembers, detail,
      exportMembers, exportPDF, styles,
      isOpenDeleteModal, confirmationMessage, deleteId, successMessage
    } = this.state;

    return (
      <Fragment>
        <MainTopBar />

        { 
          isOpenDeleteModal && 
          <Prompt 
            title={confirmationMessage} 
            id={deleteId} 
            handleAccept={this.handleDeleteClub.bind(this)} 
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
                    <Row className="mt-2">
                      <Col md="6" sm="12">

                      </Col>
                      <Col md="6" sm="12" className="table-responsive">
                        <CompetitionSelectTable
                          items={editMembers}
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
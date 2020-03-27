import React, { Component, Fragment } from 'react';
import { 
  PDFViewer , Page, Text, Canvas, View, Document, StyleSheet, 
} from '@react-pdf/renderer';
import {
  Container, Row, Col
} from 'reactstrap';
import { Segment } from 'semantic-ui-react';
import Api from '../../apis/app';
import MainTopBar from '../../components/TopBar/MainTopBar';
import CompetitionClubTable from '../../components/CompetitionClubTable';
import CompetitionSelectTable from '../../components/CompetitionSelectTable';
import { object } from 'yup';

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
      selectMembers: [],
      detail: false,
      exportPDF: false,
      styles
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

    params.competition_id = this.state.competition_id;
    params.club_id = club_id;

    if (action == 'detail') {
      const selects = await Api.post('competition-members', params);
      switch (selects.response.status) {
        case 200:
          this.setState({
            selectMembers: selects.body.data,
            detail: true,
            exportPDF: false
          });
          break;
        default:
          break;
      }
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

    if (action == 'export') {
      const selects = await Api.post('competition-members', params);
      switch (selects.response.status) {
        case 200:console.log(selects.body.data)
          this.setState({
            exportMembers: selects.body.data,
            detail: false,
            exportPDF: true
          });
          break;
        default:
          break;
      }
    }
  }

  render() {
    const { 
      competition, clubs, 
      selectMembers, detail, 
      exportMembers, styles, exportPDF 
    } = this.state;

    return (
      <Fragment>
        <MainTopBar />

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
            {
              clubs && clubs.length > 0 && (
                <Row className="mt-5">
                  <CompetitionClubTable
                    items={clubs}
                    onSelect={this.handleSelectClub.bind(this)}
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
              detail && selectMembers && selectMembers.length == 0 && (
                <div className="fixed-content">
                  <h3 className="text-muted">
                    No results!
                  </h3>
                </div>
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
        </div>
      </Fragment>
    );
  }
}

export default CompetitionDetail;
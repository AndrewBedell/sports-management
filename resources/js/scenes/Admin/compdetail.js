/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import { Segment } from 'semantic-ui-react';
import { 
  Row, Col, Button
} from 'reactstrap';

import { Grid, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { GridPDFExport } from '@progress/kendo-react-pdf';

import Api from '../../apis/app';

import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import CompetitionClubTable from '../../components/CompetitionClubTable';
import CompetitionSelectTable from '../../components/CompetitionSelectTable';

class CompetitionDetail extends Component {
  constructor(props) {
    super(props);

    this.state={
      is_super: 1,
      competition: [],
      clubs: [],
      detail: false,
      selectMembers: [],
      exportPDF: false,
      exportMembers: [],
      pageSize: 5,
      data: [],
      skip: 0
    }
  }

  async componentDidMount() {
    const competition_id = this.props.location.state;
    
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

    if (action == 'detail') {
      this.setState({
        selectMembers: members,
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
        detail: false,
        exportPDF: true,
        data: exportMembers.slice(0, this.state.pageSize)
      });
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

  handleBack() {
    this.props.history.push('/admin/competitions');
  }

  render() {
    const {
      is_super,
      competition, clubs,
      detail, selectMembers,
      exportPDF, exportMembers,
      pageSize, data, skip
    } =this.state;

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
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <div className="content">
              <div className="mt-3 w-100 d-flex justify-content-end">
                <a className="detail-link mr-4" onClick={this.handleBack.bind(this)}>
                  <i className="fa fa-angle-double-left"></i> Back
                </a>
              </div>
              <Segment>
                <Row>
                  <Col sm="12">
                    <h3 className="text-center">{competition.name}</h3>
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
                  <Row>
                    <Col sm="12">
                      <CompetitionClubTable
                        items={clubs}
                        onSelect={this.handleSelectClub.bind(this)}
                        is_super={is_super}
                      />
                    </Col>
                  </Row>
                )
              }
              {
                detail && selectMembers && selectMembers.length > 0 && (
                  <Row className="mt-3">
                    <Col sm="12">
                      <CompetitionSelectTable
                        items={selectMembers}
                      />
                    </Col>
                  </Row>
                )
              }
              {
                exportPDF && (
                  <Row className="mt-3">
                    <Col sm="12">
                      {grid}
                      <GridPDFExport
                        paperSize="A4"
                        margin={{ top: 60, left: 30, right: 30, bottom: 30 }}
                        landscape={true}
                        ref={pdfExport => this.gridPDFExport = pdfExport}
                      >
                        {grid}
                      </GridPDFExport>
                    </Col>
                  </Row>
                )
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(CompetitionDetail);
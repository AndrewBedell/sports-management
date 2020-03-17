/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, { Component, Fragment } from 'react';
import {
  withRouter
} from 'react-router-dom';
import { 
  Row, Col, Progress
} from 'reactstrap';
import { Table, Card } from 'semantic-ui-react';
import Chart from 'react-apexcharts';

import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';

class Admin extends Component {
  constructor(props) {
    super(props);

    const user = JSON.parse(localStorage.getItem('auth'));

    if (user.user.is_super == 0) this.props.history.push('/');

    this.state = {
      pieChart: {},
      lineChart: []
    }
  }

  componentDidMount() {
    this.setState({
      pieChart: {
        series: [44, 55],
        chartOptions: {
          labels: ["CHN", "KAZ"],
          dataLabels: {
            enabled: true
          },
          responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    show: false
                }
            }
          }],
          legend: {
            position: 'right',
            offsetY: 0
          }
        }
      },
      lineChart: [
        {
          series: [{
            name: "Judokas",
            data: [10, 41, 35, 51, 49, 62, 69, 91, 48]
          }],
          options: {
            chart: {
              zoom: {
                enabled: false
              }
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'straight'
            },
            title: {
              text: 'China Federation',
              align: 'center'
            },
            grid: {
              row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
              },
            },
            xaxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            }
          }
        },
        {
          series: [{
            name: "Judokas",
            data: [51,  91, 48, 49, 62, 69, 10, 41, 35]
          }],
          options: {
            chart: {
              zoom: {
                enabled: false
              }
            },
            colors: ['#00e396'],
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'straight'
            },
            title: {
              text: 'Kazakhstan Federation',
              align: 'center'
            },
            grid: {
              row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
              },
            },
            xaxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            }
          }
        }
      ]
    });
  }

  render() {
    const { pieChart, lineChart } = this.state;

    let d = new Date();
    let month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
    
    let date = month[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    
    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <Row className="mb-1">
              <Col sm="6"><h4><b>Home</b></h4></Col>
              <Col className="text-right" sm="6">
                <a href="#"><i className="fa fa-download"></i>&nbsp;&nbsp;&nbsp;EXPORT</a>
              </Col>
            </Row>

            <div className="home-content">
              <Row className="mb-4">
                <Col sm="6" md="4" lg="2">
                  <Card>
                    <Card.Content className="text-center">
                      <Card.Header><h5>All Paid Members</h5></Card.Header>
                      <Card.Description>
                        25140 Users
                      </Card.Description>
                    </Card.Content>
                  </Card>
                </Col>
                <Col sm="6" md="4" lg="2">
                  <Card>
                    <Card.Content className="text-center">
                      <Card.Header><h5>Total Amount</h5></Card.Header>
                      <Card.Description>
                        $ 20,304
                      </Card.Description>
                    </Card.Content>
                  </Card>
                </Col>
                <Col className="text-right" sm="12" md="4" lg="8">
                  <h4>{date}</h4>
                </Col>
              </Row>
              <Row className="row-0">
                <Col sm="12" md="6" lg="3">
                  {
                    pieChart && pieChart.series && (
                      <Chart className="mt-4"
                        options={pieChart.chartOptions}
                        series={pieChart.series}
                        type="donut"
                      />
                    )
                  }
                </Col>
                <Col sm="12" md="6" lg="9">
                  <Row>
                    <Col md="12" lg="6">
                      {
                        lineChart && lineChart[0] && lineChart[0].series && (
                          <Chart
                            options={lineChart[0].options}
                            series={lineChart[0].series}
                            type="line"
                          />
                        )
                      }
                    </Col>
                    <Col md="12" lg="6">
                      {
                        lineChart && lineChart[1] && lineChart[1].series && (
                          <Chart
                            options={lineChart[1].options}
                            series={lineChart[1].series}
                            type="line"
                          />
                        )
                      }
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="row-0 mt-4">
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell width="2"></Table.HeaderCell>
                      <Table.HeaderCell className="text-center" colSpan="2">
                        Payment Confirmed
                      </Table.HeaderCell>
                      <Table.HeaderCell className="text-center" colSpan="2">
                        Not Paid
                      </Table.HeaderCell>
                      <Table.HeaderCell className="text-center" colSpan="2">
                        Pending
                      </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell width="2"></Table.HeaderCell>
                      <Table.HeaderCell colSpan="2" className="text-center">
                        Judokas ( % )
                      </Table.HeaderCell>
                      <Table.HeaderCell colSpan="2" className="text-center">
                        Judokas ( % )
                      </Table.HeaderCell>
                      <Table.HeaderCell colSpan="2" className="text-center">
                        Judokas ( % )
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>1. China Federation</Table.Cell>
                      <Table.Cell width="1" className="text-center">284 ( 25% )</Table.Cell>
                      <Table.Cell width="3" className="bar">
                        <div className="success-div">
                          <Progress bar color="success" value="25" />
                        </div>
                      </Table.Cell>
                      <Table.Cell width="1" className="text-center">612 ( 62% )</Table.Cell>
                      <Table.Cell width="3" className="bar">
                        <div className="danger-div">
                          <Progress bar color="danger" value="62" />
                        </div>
                      </Table.Cell>
                      <Table.Cell width="1" className="text-center">144 ( 13% )</Table.Cell>
                      <Table.Cell width="3" className="bar">
                        <div className="warning-div">
                          <Progress bar color="warning" value="13" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>2. Kazakhstan Federation</Table.Cell>
                      <Table.Cell className="text-center">88 ( 44% )</Table.Cell>
                      <Table.Cell width="3" className="bar">
                        <div className="success-div">
                          <Progress bar color="success" value="44" />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-center">54 ( 27% )</Table.Cell>
                      <Table.Cell width="3" className="bar">
                        <div className="danger-div">
                          <Progress bar color="danger" value="27" />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-center">58 ( 29% )</Table.Cell>
                      <Table.Cell width="3" className="bar">
                        <div className="warning-div">
                          <Progress bar color="warning" value="29" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Row>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Admin);

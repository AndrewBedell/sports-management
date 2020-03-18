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
import Api from '../../apis/app';
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
      nfs: [],
      pieChart: {},
      lineChart: [],
      confirmed: [],
      notpayed: [],
      pending: [],
      sum: []
    }
  }

  async componentDidMount() {
    const nfs = await Api.get('all-nf');
    const { response, body } = nfs;

    switch (response.status) {
      case 200:
        this.setState({
          nfs: body.nfs
        });
        break;
      default:
        break;
    }

    const colorList = ['#4661EE', '#66DA26', '#E91E63', '#FF9800', '#546E7A',  
                       '#EC5657', '#1BCDD1', '#8FAABB', '#B08BEB', '#FAA586'];

    const pieSeries = [];
    const pieLabels = [];
    const pieColors = [];

    const lineSeries = [];
    const lineLabels = [];
    const lineCharts = [];

    const confirmed = [];
    const notpayed = [];
    const pending = [];

    const sum = [];

    for (let i = 0; i < this.state.nfs.length; i++) {
      pieSeries.push(Math.floor((Math.random() * 100) + 1));
      pieLabels.push(this.state.nfs[i].name_s);
      pieColors.push(colorList[i]);

      let lineData = [];
      for (let j = 0; j < 9; j++) {
        lineData.push(Math.floor((Math.random() * 50) + 50));
      }

      lineSeries.push(lineData);
      lineLabels.push(this.state.nfs[i].name_o);

      let chart = {
        series: [{
          name: "Judokas",
          data: lineSeries[i]
        }],
        options: {
          chart: {
            zoom: {
              enabled: false
            }
          },
          colors: [colorList[i]],
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'straight'
          },
          title: {
            text: lineLabels[i],
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

      lineCharts.push(chart);

      let confirm = Math.floor((Math.random() * 100) + 200);
      confirmed.push(confirm);

      let notpay = Math.floor((Math.random() * 100) + 50);
      notpayed.push(notpay);

      let pend = Math.floor((Math.random() * 50) + 50);
      pending.push(pend);

      sum.push(confirm + notpay + pend);
    }

    this.setState({
      pieChart: {
        series: pieSeries,
        chartOptions: {
          labels: pieLabels,
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
          fill: {
            colors: pieColors,
            type: 'gradient',
          },
          legend: {
            position: 'right',
            markers: {
              fillColors: pieColors
            },
            offsetY: 0
          }
        }
      },
      lineChart: lineCharts,
      confirmed,
      notpayed,
      pending,
      sum
    });
  }

  handleSelectItem(id) {
    localStorage.setItem('nf_id', id)
    this.props.history.push('/admin/search');
  }

  render() {
    const { 
      pieChart, lineChart, nfs,
      confirmed, notpayed, pending, sum
    } = this.state;

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
                  <Row className="line-chart">
                    <Col md="12" lg="6">
                      {
                        lineChart && lineChart[0] && lineChart[0].series && (
                          <Chart
                            options={lineChart[0].options}
                            series={lineChart[0].series}
                            type="line"
                            onClick={() => this.props.history.push('/admin/detail')}
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
                            onClick={() => this.props.history.push('/admin/detail')}
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
                    {
                      nfs && nfs.length > 0 && (
                        nfs.map((item, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>
                              <a
                                className="detail-link" 
                                onClick={this.handleSelectItem.bind(this, item.id)}
                              >
                                {index + 1}. {item.name_o}
                              </a>
                            </Table.Cell>
                            <Table.Cell width="1" className="text-center">
                              {confirmed[index]} ( {Math.floor(confirmed[index] / sum[index] * 100)}% )
                            </Table.Cell>
                            <Table.Cell width="3" className="bar">
                              <div className="success-div">
                                <Progress bar color="success" value={Math.floor(confirmed[index] / sum[index] * 100)} />
                              </div>
                            </Table.Cell>
                            <Table.Cell width="1" className="text-center">
                              {notpayed[index]} ( {Math.floor(notpayed[index] / sum[index] * 100)}% )
                            </Table.Cell>
                            <Table.Cell width="3" className="bar">
                              <div className="danger-div">
                                <Progress bar color="danger" value={Math.floor(notpayed[index] / sum[index] * 100)} />
                              </div>
                            </Table.Cell>
                            <Table.Cell width="1" className="text-center">
                              {pending[index]} ( {Math.floor(pending[index] / sum[index] * 100)}% )
                            </Table.Cell>
                            <Table.Cell width="3" className="bar">
                              <div className="warning-div">
                                <Progress bar color="warning" value={Math.floor(pending[index] / sum[index] * 100)} />
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )
                    }
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
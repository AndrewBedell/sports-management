/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, { Component, Fragment } from 'react';
import {
  withRouter
} from 'react-router-dom';
import {
  Container,
  Row,
  Col
} from 'reactstrap';
import Chart from 'chart.js';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import Api from '../../apis/app';

import TransactionTable from '../../components/TransactionTable';
import PlayerPayTable from '../../components/PlayerPayTable';

class Admin extends Component {
  constructor(props) {
    super(props);

    const user = JSON.parse(localStorage.getItem('auth'));
    
    if (user.user.is_super == 0)
      this.props.history.push('/');

    this.state = {
      items: [],
      players: [],
      total: [],
      subtotal: [],
      detail: [],
      data: [],
      nfs: [],
      line1: false,
      line2: false,
    }
    
    this.chartRef1 = React.createRef();
    this.chartRef2 = React.createRef();
    this.chartRef3 = React.createRef();
  }

  async componentDidMount() {
    const org = await Api.get('finance');
    const { response, body } = org;
    switch (response.status) {
      case 200:
        this.setState({
          total: body.total,
          subtotal: body.subtotal,
          detail: body.detail,
          // data: body.data,
          nfs: body.nfs
        })
        break;
      default:
        break;
    }

    let nflabels = [];
    let amounts = [];

    for (var i = 0; i < this.state.nfs.length; i++) {
      nflabels.push(this.state.nfs[i].name_o);
      amounts.push(this.state.total[i] / 100);
    }

    this.pieChart = new Chart(this.chartRef1.current, {
      type: 'pie',
      data: {
        labels: nflabels,
        datasets: [{
          data: amounts,
          fill: 'none',
          backgroundColor: '#00FF00',
          pointRadius: 5,
          borderColor: '#FF0000',
          borderWidth: 2
        }]
      }
    });

    let labels = [];
    amounts = [];

    for (var i = 0; i < this.state.subtotal[0].length; i++) {
      labels.push(this.state.subtotal[0][i].new_date);
      amounts.push(this.state.subtotal[0][i].amount);
    }

    this.lineChart1 = new Chart(this.chartRef2.current, {
      type: 'line',
      
      data: {
        labels: labels,
        datasets: [{
          label: nflabels[0],
          data: amounts,
          fill: 'none',
          backgroundColor: '#00FF00',
          pointRadius: 5,
          borderColor: '#FF0000',
          borderWidth: 2,
          bezierCurve: true
        }]
      }
    });

    labels = [];
    amounts = [];

    for (var i = 0; i < this.state.subtotal[1].length; i++) {
      labels.push(this.state.subtotal[1][i].new_date);
      amounts.push(this.state.subtotal[1][i].amount);
    }

    this.lineChart2 = new Chart(this.chartRef3.current, {
      type: 'line',
      
      data: {
        labels: labels,
        datasets: [{
          label: nflabels[1],
          data: amounts,
          fill: 'none',
          backgroundColor: '#00FF00',
          pointRadius: 5,
          borderColor: '#0000FF',
          borderWidth: 2,
          bezierCurve: true
        }]
      }
    });

    if (this.state.items.length > 0) {
      this.setState({
        activePage: 1
      });
    }
    const { items } = this.state;
    const { per_page } = this.state;
    this.setState({
      data: items.slice(0, per_page)
    });
  }

  async handleSelectItem(id) {
    const trans = await Api.get(`transdetail/${id}`);
    const { response, body } = trans;
    switch (response.status) {
      case 200:
        this.setState({
          players: body.members
        });
        break;
      default:
        break;
    }
  }

  detail(chart) {
    this.setState({
      line1: (chart == 'line1' ? true : false),
      line2: (chart == 'line2' ? true : false),
    });
  }

  render() {
    const {
      players,
      detail, 
      line1, 
      line2,
    } = this.state;
    
    if (line1)
      var index = 0;

    if (line2)
      var index = 1;

    if (index == 0 || index == 1) {
      for (var i = 0; i < detail[index].length; i++) {
        if (!Array.isArray(detail[index][i]['players']))
          detail[index][i]['players'] = detail[index][i]['players'].split(',');
      }
    }

    return (
      <Fragment>
        <AdminTopBar/>

        <div className="main-content dashboard">
          <Container fluid>
            <Row>
              <Col sm="4">
                <canvas
                  id="pieChart"
                  ref={this.chartRef1}
                />
              </Col>
              <Col sm="4">
                <canvas
                  id="lineChart1"
                  ref={this.chartRef2}
                  onClick={this.detail.bind(this, 'line1')}
                />
              </Col>
              <Col sm="4">
                <canvas
                  id="lineChart2"
                  ref={this.chartRef3}
                  onClick={this.detail.bind(this, 'line2')}
                />
              </Col>
            </Row>
            <Row>
              <Col sm="8">
                <div className="table-responsive mt-5">
                  {
                    line1 && (
                    <TransactionTable
                      items={detail[0]}
                      onSelect={this.handleSelectItem.bind(this)}
                    />
                    )
                  }
                  {
                    line2 && (
                    <TransactionTable
                      items={detail[1]}
                      onSelect={this.handleSelectItem.bind(this)}
                    />
                    )
                  }
                </div>
              </Col>
              <Col sm="4">
                <div className="table-responsive mt-5">
                {
                  players.length > 0 && (
                    <PlayerPayTable
                      players={players}
                    />  
                  )
                }
                </div>
              </Col>
            </Row>
          </Container>
        </div>
        
      </Fragment>
    );
  }
}

export default withRouter(Admin);
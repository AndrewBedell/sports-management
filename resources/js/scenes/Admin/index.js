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
  Container,
  Row,
  Col
} from 'reactstrap';
import Chart from 'chart.js';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import Api from '../../apis/app';

class Admin extends Component {
  constructor(props) {
    super(props);

    const user = JSON.parse(localStorage.getItem('auth'));
    
    if (user.user.is_super == 0)
      this.props.history.push('/');

    this.state = {
      total: [],
      subtotal: [],
      detail: [],
      data: [],
      nfs: []
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
          data: body.data,
          nfs: body.nfs
        })
        break;
      default:
        break;
    }

    let labels = [];
    let amounts = [];

    for (var i = 0; i < this.state.nfs.length; i++) {
      labels.push(this.state.nfs[i].name_o);
      amounts.push(this.state.total[i] / 100);
    }

    this.pieChart = new Chart(this.chartRef1.current, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Organization Pie Chart',
          data: amounts,
          fill: 'none',
          backgroundColor: '#00FF00',
          pointRadius: 5,
          borderColor: '#FF0000',
          borderWidth: 2
        }]
      }
    });

    labels = [];
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
          label: 'Organization1 Line Chart',
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
          label: 'Organization2 Line Chart',
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
  }

  render() {
    const {detail, data, nfs} = this.state;
    
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
                />
              </Col>
              <Col sm="4">
                <canvas
                  id="lineChart2"
                  ref={this.chartRef3}
                />
              </Col>
            </Row>
          </Container>
        </div>
        
      </Fragment>
    );
  }
}

export default withRouter(Admin);
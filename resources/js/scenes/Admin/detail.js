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
  Row, Col
} from 'reactstrap';
import Api from '../../apis/app';
import Chart from 'react-apexcharts';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import NFTable from '../../components/NFTable';
import PlayerPayTable from '../../components/PlayerPayTable';

class Detail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      detail: [],
      nfs: [],
      players: [],

      series: [{
        name: 'Likes',
        data: [4, 20]
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
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            gradientToColors: [ '#FDD835'],
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100]
          },
        },
        stroke: {
          width: 3,
          curve: 'smooth'
        },
        title: {
          text: 'Total',
          align: 'left',
          style: {
            fontSize: "16px",
            color: '#666'
          }
        },
        xaxis: {
          type: 'datetime',
          categories: ['2020-03-19', '2020-03-20'],
        },
        yaxis: {
          min: 0,
          max: 40,
          title: {
            text: 'Engagement',
          },
        }
      },
    };
  }

  async componentDidMount() {
    const org = await Api.get('finance');
    const { response, body } = org;
    switch (response.status) {
      case 200:
        this.setState({
          nfs: body.nfs
        });
        break;
      default:
        break;
    }
  }

  async handleSelectItem(id) {
    const trans = await Api.get(`playerdetail/${id}`);
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

  render() {
    const { nfs, players } = this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <h4><b>Detail</b></h4>

            <div className="content">
              <Row className="row-0">
                <Col sm="12">
                  <Chart
                    options={this.state.options}
                    series={this.state.series}
                    height="300"
                    type="line"
                  />
                </Col>
              </Row>
              <Row>
                <Col sm="6">
                  <div className="table-responsive mt-5">
                  {
                    nfs.length > 0 && (
                      <NFTable
                        items={nfs}
                        onSelect={this.handleSelectItem.bind(this)}
                      />
                    )
                  }
                  </div>
                </Col>
                <Col sm="6">
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
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Detail);
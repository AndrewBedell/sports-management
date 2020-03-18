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
        data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5]
      }],
      options: {
        chart: {
          height: 350,
          width: '100%',
          type: 'line',
        },
        stroke: {
          width: 7,
          curve: 'smooth'
        },
        xaxis: {
          type: 'datetime',
          categories: ['1/11/2000', '2/11/2000', '3/11/2000', '4/11/2000', '5/11/2000', '6/11/2000', '7/11/2000', '8/11/2000', '9/11/2000', '10/11/2000', '11/11/2000', '12/11/2000', '1/11/2001', '2/11/2001', '3/11/2001','4/11/2001' ,'5/11/2001' ,'6/11/2001'],
        },
        title: {
          text: 'Social Media',
          align: 'left',
          style: {
            fontSize: "16px",
            color: '#666'
          }
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
        markers: {
          size: 4,
          colors: ["#FFA41B"],
          strokeColors: "#fff",
          strokeWidth: 2,
          hover: {
            size: 7,
          }
        },
        yaxis: {
          min: -10,
          max: 40,
          title: {
            text: 'Engagement',
          },
        }
      }
    };
  }

  async componentDidMount() {
    const org = await Api.get('finance');
    const { response, body } = org;
    switch (response.status) {
      case 200:
        this.setState({
          nfs: body.nfs,
          detail: body.detail
        });
        break;
      default:
        break;
    }
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
                <Chart
                  options={this.state.options}
                  series={this.state.series}
                  type="line"
                />
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
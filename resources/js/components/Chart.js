import React, { Fragment } from 'react';

const LineChart = require('react-chartjs').Line;

class ChartsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLine: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'My First dataset',
            fill: true,
            lineTension: 0.3,
            backgroundColor: '#01B37B',
            borderColor: 'rgb(205, 130, 158)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgb(205, 130,1 58)',
            pointBackgroundColor: 'rgb(255, 255, 255)',
            pointBorderWidth: 10,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgb(0, 0, 0)',
            pointHoverBorderColor: 'rgba(220, 220, 220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [65, 59, 80, 81, 56, 55, 40]
          },
          {
            label: 'My Second dataset',
            fill: true,
            lineTension: 0.3,
            backgroundColor: '#01B37B',
            borderColor: 'rgb(35, 26, 136)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgb(35, 26, 136)',
            pointBackgroundColor: 'rgb(255, 255, 255)',
            pointBorderWidth: 10,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgb(0, 0, 0)',
            pointHoverBorderColor: 'rgba(220, 220, 220, 1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [28, 48, 40, 19, 86, 27, 90]
          }
        ]
      }
    };
  }

  render() {
    return (
      <Fragment>
        <LineChart data={this.state.dataLine} options={{ responsive: true }} />
      </Fragment>
    );
  }
}

export default ChartsPage;

/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import {
  Container
} from 'reactstrap';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import SettingTable from '../../components/SettingTable';

class Setting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: []
    };
  }

  async componentDidMount() {
    const data = await Api.get('allsetting');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          items: body
        });
        break;
      default:
        break;
    }
  }

  render() {
    const {items} = this.state;

    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container>
            <div className="setting table-responsive">
              {
                items.length > 0 && (
                  <SettingTable
                    items={items}
                  />
                )
              }
            </div>
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default Setting;

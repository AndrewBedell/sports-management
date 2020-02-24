import React, { Component, Fragment } from 'react';
import {
  Container, Row, Col, Button, Alert
} from 'reactstrap';
import {
  withRouter
} from 'react-router-dom';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import DataTable from '../../components/DataTable';
import { search_type_options } from '../../configs/data';
import Prompt from '../../components/Prompt';
import EditModal from '../../components/EditModal';

class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      org_list: [],
      weights: [],
      roles: [],
      isOpenDeleteModal: false,
      isOpenEditModal: false,
      edit_item: '',
      confirmationMessage: '',
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
      deleteId: '',
      editIndex: -1
    };
  }

  async componentDidMount() {
    const data = await Api.get('members');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          members: body
        });
        break;
      case 406:
        break;
      default:
        break;
    }
    this.componentWillReceiveProps(this.props);
  }

  async componentWillReceiveProps() {
    const org_response = await Api.get('organizations-list');
    const { response, body } = org_response;
    switch (response.status) {
      case 200:
        this.setState({
          org_list: body
        });
        break;
      default:
        break;
    }
    const weight_list = await Api.get('weights');
    switch (weight_list.response.status) {
      case 200:
        this.setState({
          weights: weight_list.body
        });
        if (weight_list.body.length > 0) {
          localStorage.setItem('weights', JSON.stringify(weight_list.body));
        }
        break;
      default:
        break;
    }
    const role_lists = JSON.parse(localStorage.getItem('roles'));
    if (role_lists && role_lists.length > 0) {
      this.setState({
        roles: role_lists
      });
    } else {
      const role_list = await Api.get('roles');
      switch (role_list.response.status) {
        case 200:
          this.setState({
            roles: role_list.body
          });
          if (role_list.body.length > 0) {
            localStorage.setItem('roles', JSON.stringify(role_list.body));
          }
          break;
        default:
          break;
      }
    }
  }

  handleEdit(id, index) {
    const { isOpenEditModal } = this.state;
    this.setState({
      isOpenEditModal: !isOpenEditModal,
      edit_item: id,
      editIndex: index
    });
  }

  handleDelete(id) {
    const { members } = this.state;
    let delItem = '';
    for (let i = 0; i < members.length; i++) {
      const item = members[i];
      if (item.id === id) {
        delItem = item;
      }
    }
    this.setState({
      isOpenDeleteModal: true,
      deleteId: id,
      confirmationMessage: `Are you sure you want to delete ${delItem.first_name} ${delItem.mid_name} ${delItem.last_name}?`
    });
  }

  async handleDeleteMember(id) {
    const { members } = this.state;
    const delMem = await Api.delete(`member/${id}`);
    switch (delMem.response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          isOpenDeleteModal: false,
          successMessage: delMem.body.message,
          members: members.filter(item => item.id !== id)
        });
        break;
      case 406:
        this.setState({
          alertVisible: true,
          messageStatus: false,
          isOpenDeleteModal: false,
          failMessage: delMem.body.message
        });
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.setState({ alertVisible: false });
    }, 2000);
  }

  async handleSaveItem(id, item) {
    const { editIndex, members } = this.state;
    const updateMem = await Api.put(`member/${id}`, item);
    switch (updateMem.response.status) {
      case 200:
        members[editIndex] = item;
        this.setState({
          isOpenEditModal: false,
          messageStatus: true,
          alertVisible: true,
          successMessage: `${item.first_name} ${item.mid_name} ${item.last_name} is been update successfully!`,
          members
        });
        break;
      case 406:
        this.setState({
          alertVisible: true,
          messageStatus: false,
          isOpenEditModal: false,
          failMessage: updateMem.body.message
        });
        break;
      case 500:
        this.setState({
          alertVisible: true,
          messageStatus: false,
          isOpenEditModal: false,
          failMessage: 'Internal Server Error!'
        });
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.setState({ alertVisible: false });
    }, 2000);
  }

  handleConfirmationClose() {
    this.setState({
      isOpenDeleteModal: false,
      confirmationMessage: ''
    });
  }

  handleSelectItem(id) {
    this.props.history.push('/member/detail', id);
  }

  render() {
    const {
      members,
      weights,
      org_list,
      roles,
      isOpenDeleteModal,
      confirmationMessage,
      isOpenEditModal,
      edit_item
    } = this.state;
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container>
            <Row className="mb-5">
              <Col xs="6">
                <Button
                  type="button"
                  color="primary"
                  onClick={() => this.props.history.push('/')}
                >
                  Go Home
                </Button>
              </Col>
              <Col xs="6" className="text-right">
                <Button
                  type="button"
                  color="primary"
                  className="ml-auto"
                  onClick={() => this.props.history.push('/member/register')}
                >
                  Register Member
                </Button>
              </Col>
            </Row>
          </Container>
          <Container fluid>
            <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
              {
                this.state.messageStatus ? this.state.successMessage : this.state.failMessage
              }
            </Alert>
            <div className="table-responsive">
              <DataTable
                type={search_type_options[2]}
                items={members}
                onEdit={this.handleEdit.bind(this)}
                onDelete={this.handleDelete.bind(this)}
                onSelect={this.handleSelectItem.bind(this)}
              />
            </div>
          </Container>
          { isOpenDeleteModal && <Prompt title={confirmationMessage} id={this.state.deleteId} handleAccept={this.handleDeleteMember.bind(this)} handleCancel={this.handleConfirmationClose.bind(this)} /> }
          {
            isOpenEditModal && (
            <EditModal
              id={edit_item}
              type={search_type_options[2]}
              weights={weights}
              orgs={org_list}
              roles={roles}
              handleSave={this.handleSaveItem.bind(this)}
              handleCancel={this.handleEdit.bind(this)}
            />
            )
          }
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Members);

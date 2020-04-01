/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Row, Col,
  Form, FormGroup, FormFeedback,
  Input, Label,
  Button, 
  UncontrolledAlert,
  Alert
} from 'reactstrap';
import Select from 'react-select';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

import {
  CompetitionType, CompetitionLevel
} from '../../configs/data';

class CreateComp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      creator_id: [],
      unit_list: [],
      nf_list: [],
      org_list: [],
      club_list: [],
      all_org_list: [],
      all_club_list: [],
      from: null,
      to: null,
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: '',
      competitionType: [],
      user_level: ''
    }

    this.formikRef = React.createRef();
  }

  async componentDidMount() {
    const user = JSON.parse(localStorage.getItem('auth'));
    const user_level = user.user.level;

    this.setState({
      creator_id: user.user.member_info.organization_id,
      user_level
    });

    switch (user_level) {
      case 1:
        const nf_response = await Api.get('all-nf');
        switch (nf_response.response.status) {
          case 200:
            this.setState({
              nf_list: nf_response.body.nfs.filter(nfs => nfs.id != user.user.member_info.organization_id)
            });
            break;
          default:
            break;
        }
        const org_response = await Api.get('organizations-list');
        switch (org_response.response.status) {
          case 200:
            this.setState({
              org_list: org_response.body.filter(org => org.parent_id != 0)
            });
            break;
          default:
            break;
        }
        this.setState({
          competitionType: CompetitionType.filter(type => type.value == 'inter' || type.value == 'nf')
        });
        break;
      case 2:
        const reg_response = await Api.get('reg-clubs-list');
        switch (reg_response.response.status) {
          case 200:
            this.setState({
              all_org_list: reg_response.body.orgs,
              all_club_list: reg_response.body.clubs
            });
            break;
          default:
            break;
        }
        this.setState({
          competitionType: CompetitionType.filter(type => type.value == 'reg')
        });
        break;
      case 3:
        const all_response = await Api.get('clubs-list');
        switch (all_response.response.status) {
          case 200:
            this.setState({
              all_org_list: all_response.body.orgs,
              all_club_list: all_response.body.clubs
            });
            break;
          default:
            break;
        }
        this.setState({
          competitionType: CompetitionType.filter(type => type.value == 'club')
        });
        break;
      default:
        break;
    }
  }

  onChangeFrom(event, data) {
    if (data.value) {
      let from = this.convertDate(data.value);

      this.setState({
        from
      });
    } else {
      this.setState({
        from: null
      });
    }
  }

  onChangeTo(event, data) {
    if (data.value) {
      let to = this.convertDate(data.value);

      this.setState({
        to
      });
    } else {
      this.setState({
        to: null
      });
    }
  }

  convertDate(d) {
    let year = d.getFullYear();

    let month = d.getMonth() + 1;
    if (month < 10)
      month = '0' + month;

    let day = d.getDate();
    if (day < 10)
      day = '0' + day;

    return (year + '-' + month + '-' + day);
  }

  async handleSubmit(values, bags) {
    if (!this.state.from || !this.state.to) {
      bags.setSubmitting(false);
      return;
    }

    let newData = {};

    let unit_ids = '';
    for (let i = 0; i < values.unit_ids.length; i++) {
      unit_ids += values.unit_ids[i].id + ',';
    }

    newData = {
      creator_id: this.state.creator_id,
      type: values.type.value,
      level: values.level.value,
      name: values.name,
      place: values.place,
      from: this.state.from,
      to: this.state.to,
      unit_ids: unit_ids.substring(0, unit_ids.length - 1)
    }

    const data = await Api.post('reg-competition', newData);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          successMessage: 'Added Successfully!'
        });

        setTimeout(() => {
          this.setState({ alertVisible: false });
          this.props.history.goBack();
        }, 2000);
        break;
      case 406:
        if (body.message) {
          bags.setStatus({
            color: 'danger',
            children: body.message
          });
        }
        break;
      case 422:
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  render() {
    const {
      unit_list, nf_list, org_list, club_list,
      all_org_list, all_club_list,
      from, to, competitionType, user_level
    } = this.state;

    return(
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container>
            <div className="w-100 mb-5">
              <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
                {
                  this.state.messageStatus ? this.state.successMessage : this.state.failMessage
                }
              </Alert>
            </div>
            <Formik
              ref={this.formikRef}

              initialValues={{
                creator_id: null,
                type: null,
                level: null,
                name: '',
                place: '',
                from: null,
                to: null,
                reg_ids: null,
                unit_ids: null
              }}

              validationSchema={
                Yup.object().shape({
                  type: Yup.mixed().required('This field is required!'),
                  level: Yup.mixed().required('This field is required!'),
                  name: Yup.mixed().required('This field is required!'),
                  place: Yup.mixed().required('This field is required!'),
                  unit_ids: Yup.mixed().required('This field is required!')
                })
              }

              onSubmit={this.handleSubmit.bind(this)}

              render={({
                values,
                errors,
                status,
                touched,
                setFieldValue,
                handleBlur,
                handleChange,
                handleSubmit,
                isSubmitting
              }) => (
                <Form onSubmit={handleSubmit}>
                  {status && <UncontrolledAlert {...status} />}
                  <Row>
                    <Col xs="12" sm="6">
                      <FormGroup>
                        <Label for="type">Competition Type</Label>
                        <Select
                          name="type"
                          classNamePrefix={!values.type && touched.type ? 'invalid react-select-lg' : 'react-select-lg'}
                          indicatorSeparator={null}
                          options={competitionType}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          value={values.type}
                          onChange={(value) => {
                            setFieldValue('type', value);

                            if (value.value === 'inter') {
                              this.setState({
                                unit_list: nf_list
                              });
                            }
                            
                            if (value.value === 'nf') {
                              this.setState({
                                unit_list: org_list
                              });
                            }

                            if (value.value === 'reg' || value.value === 'club') {
                              this.setState({
                                org_list: all_org_list
                              });
                            }
                          }}
                          onBlur={this.handleBlur}
                        />
                        {!values.type && touched.type && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup>
                        <Label for="level">Competition Level</Label>
                        <Select
                          name="level"
                          classNamePrefix={!values.level && touched.level ? 'invalid react-select-lg' : 'react-select-lg'}
                          indicatorSeparator={null}
                          options={CompetitionLevel}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          value={values.level}
                          onChange={(value) => {
                            setFieldValue('level', value);
                          }}
                          onBlur={this.handleBlur}
                        />
                        {!values.level && touched.level && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="12">
                      <FormGroup>
                        <Label for="name">Competition Name</Label>
                        <Input
                          name="name"
                          type="text"
                          value={values.name || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.name && touched.name}
                        />
                        <FormFeedback>{errors.name}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!from && touched.from ? 'invalid calendar' : 'calendar'}>
                        <Label for="from">From</Label>
                        <SemanticDatepicker
                          name="from"
                          placeholder="From"
                          onChange={this.onChangeFrom.bind(this)}
                        />
                        {!from && touched.from && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6">
                      <FormGroup className={!to && touched.to ? 'invalid calendar' : 'calendar'}>
                        <Label for="to">To</Label>
                        <SemanticDatepicker
                          name="to"
                          placeholder="To"
                          onChange={this.onChangeTo.bind(this)}
                        />
                        {!to && touched.to && (
                          <FormFeedback className="d-block">This field is required!</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="12">
                      <FormGroup>
                        <Label for="place">Competition Place</Label>
                        <Input
                          name="place"
                          type="text"
                          value={values.place || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.place && touched.place}
                        />
                        <FormFeedback>{errors.place}</FormFeedback>
                      </FormGroup>
                    </Col>
                    {
                      user_level == 1 ? (
                        <Col xs="12">
                          <FormGroup>
                            <Label for="unit_ids">Organization List</Label>
                            <Select
                              name="unit_ids"
                              classNamePrefix={!values.unit_ids && touched.unit_ids ? 'invalid react-select-lg' : 'react-select-lg'}
                              indicatorSeparator={null}
                              options={unit_list}
                              isMulti
                              getOptionValue={option => option.id}
                              getOptionLabel={option => option.name_o}
                              value={values.unit_ids}
                              onChange={(value) => {
                                setFieldValue('unit_ids', value);
                              }}
                              onBlur={this.handleBlur}
                            />
                          </FormGroup>
                        </Col>
                      ) : (
                        <Fragment>
                          <Col xs="6">
                            <FormGroup>
                              <Label>Organization List</Label>
                              <Select
                                name="reg_ids"
                                classNamePrefix={
                                  !values.reg_ids && touched.reg_ids ? 'invalid react-select-lg' : 'react-select-lg'
                                }
                                indicatorSeparator={null}
                                options={org_list}
                                getOptionValue={option => option.id}
                                getOptionLabel={option => option.name_o}
                                value={values.reg_ids}
                                onChange={(value) => {
                                  setFieldValue('reg_ids', value);

                                  this.setState({
                                    club_list: all_club_list.filter(club => club.parent_id == value.id)
                                  });
                                }}
                                onBlur={this.handleBlur}
                              />
                            </FormGroup>
                          </Col>
                          <Col xs="6">
                            <FormGroup>
                              <Label for="unit_ids">Club List</Label>
                              <Select
                                name="unit_ids"
                                classNamePrefix={
                                  !values.unit_ids && touched.unit_ids ? 'invalid react-select-lg' : 'react-select-lg'
                                }
                                indicatorSeparator={null}
                                options={club_list}
                                isMulti
                                getOptionValue={option => option.id}
                                getOptionLabel={option => option.name_o}
                                value={values.unit_ids}
                                onChange={(value) => {
                                  setFieldValue('unit_ids', value);
                                }}
                                onBlur={this.handleBlur}
                              />
                            </FormGroup>
                          </Col>
                        </Fragment>
                      )
                    }
                  </Row>
                  <div className="w-100 d-flex justify-content-end">
                    <div>
                      <Button
                        className="mr-5"
                        disabled={isSubmitting}
                        type="submit"
                        color="primary"
                      >
                        Create
                      </Button>
                      <Button
                        type="button"
                        color="secondary"
                        onClick={() => this.props.history.push('/')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            />
          </Container>
        </div>
      </Fragment>
    )
  }
}

export default CreateComp;
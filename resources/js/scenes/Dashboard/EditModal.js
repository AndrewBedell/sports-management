import React from 'react';
import { Formik } from 'formik';
import moment from 'moment';
import * as Yup from 'yup';
import {
  Row, Col,
  Modal, ModalBody, ModalHeader,
  Button,
  Form, FormGroup, FormFeedback,
  Input, Label, CustomInput,
  UncontrolledAlert
} from 'reactstrap';
import Select from 'react-select';
// import DateRangePicker from '../../components/DateRangePicker';
import DatePicker from 'react-date-picker/dist/entry.nostyle';

import Api from '../../apis/app';
import { Genders, countries, Dans } from '../../configs/data';

class EditModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      isOpen: true,
      org_list: []
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  async componentWillReceiveProps(props) {
    const { id, type, orgs } = props;
    if (type.value === 'player') {
      const data = await Api.get(`member/${id}`);
      const {
        response, body
      } = data;
      switch (response.status) {
        case 200: {
          this.setState({
            item: body
          });
          break;
        }
        default:
          break;
      }
    } else {
      const data1 = await Api.get(`organization/${id}`);
      const {
        response, body
      } = data1;
      switch (response.status) {
        case 200: {
          this.setState({
            item: body
          });
          break;
        }
        default:
          break;
      }
    }
    this.setState({
      org_list: orgs.filter(org => org.is_club === 1)
    });
  }


  handleCancel() {
    let {
      handleCancel
    } = this.props;

    handleCancel = handleCancel || (() => {});
    handleCancel();
  }

  handleSubmit(values) {
    console.log(values);
    let {
      handleSave
    } = this.props;
    const { id } = this.props;

    handleSave = handleSave || (() => {});
    handleSave(id);
  }

  handleCheckbox(e) {
    const { item } = this.state;
    item.is_club = e;
    this.setState({
      item
    });
  }

  render() {
    const {
      isOpen, item, org_list
    } = this.state;
    const {
      type,
      roles,
      weights
    } = this.props;
    return (
      <Modal
        isOpen={isOpen}
        toggle={this.handleCancel}
        onClosed={this.handleCancel}
        className="modal-edit-item"
      >
        <ModalHeader toggle={this.handleCancel} style={{ borderBottom: 'none' }} />
        <ModalBody>
          {
            type.value === 'player' && item ? (
              <Formik
                initialValues={{
                  organization_id: null,
                  role_id: null,
                  profile_image: null,
                  first_name: '',
                  mid_name: '',
                  last_name: '',
                  gender: null,
                  birthday: null,
                  email: '',
                  mobile_phone: '',
                  addressline1: '',
                  addressline2: '',
                  country: null,
                  state: '',
                  city: '',
                  zip_code: '',
                  identity: '',
                  weight: null,
                  dan: null
                }}
                validationSchema={
                  Yup.object().shape({
                    organization_id: Yup.mixed().required('This field is required!'),
                    role_id: Yup.mixed().required('This field is required!'),
                    profile_image: Yup.mixed().required('Image is required!'),
                    first_name: Yup.string().required('This field is required!'),
                    last_name: Yup.string().required('This field is required!'),
                    gender: Yup.mixed().required('This field is required!'),
                    birthday: Yup.mixed().required('This field is required!'),
                    email: Yup.string().email('Email is not valid!').required('This field is required!'),
                    mobile_phone: Yup.string().min(10, 'Less than 10 characters!').required('This field is required!'),
                    addressline1: Yup.string().required('This field is required!'),
                    country: Yup.mixed().required('This field is required!'),
                    city: Yup.string().required('This field is required!'),
                    state: Yup.string().required('This field is required!'),
                    zip_code: Yup.string().min(6, 'Less than 6 characters!').required('This field is required!'),
                    identity: Yup.string().required('This field is required!'),
                    weight: Yup.mixed().required('This field is required!'),
                    dan: Yup.mixed().required('This field is required!')
                  })
                }
                onSubmit={this.handleSubmit}
                render={({
                  values,
                  errors,
                  status,
                  setFieldValue,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    {status && <UncontrolledAlert {...status} />}
                    <Row>
                      <Col sm="8">
                        <FormGroup>
                          <Label for="organization_id">
                            Organization
                          </Label>
                          <Select
                            name="organization_id"
                            classNamePrefix="react-select-lg"
                            indicatorSeparator={null}
                            options={org_list}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name}
                            value={values.organization_id}
                            onChange={(value) => {
                              setFieldValue('organization_id', value);
                            }}
                            onBlur={this.handleBlur}
                          />
                          {errors.organization_id && (
                            <FormFeedback className="d-block">{errors.organization_id}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="role_id">Role</Label>
                          <Select
                            name="role_id"
                            classNamePrefix="react-select-lg"
                            indicatorSeparator={null}
                            options={roles}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name}
                            value={values.role_id}
                            onChange={(value) => {
                              setFieldValue('role_id', value);
                            }}
                            onBlur={this.handleBlur}
                          />
                          {errors.role_id && (
                            <FormFeedback className="d-block">{errors.role_id}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col xs="12">
                        <FormGroup>
                          <Label for="profile_image">Profile Image</Label>

                          <FormFeedback>{errors.profile_image}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="first_name">
                            First name
                          </Label>
                          <Input
                            name="first_name"
                            type="text"
                            value={values.first_name || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.first_name}
                          />
                          <FormFeedback className="d-block">{errors.first_name}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="mid_name">
                            Mid name
                          </Label>
                          <Input
                            name="mid_name"
                            type="text"
                            value={values.mid_name || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="last_name">
                            Last name
                          </Label>
                          <Input
                            name="last_name"
                            type="text"
                            value={values.last_name || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.last_name}
                          />
                          <FormFeedback className="d-block">{errors.last_name}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="gender">Gender</Label>
                          <Select
                            name="gender"
                            classNamePrefix="react-select-lg"
                            indicatorSeparator={null}
                            options={Genders}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name}
                            value={values.gender}
                            onChange={(value) => {
                              setFieldValue('gender', value);
                            }}
                            onBlur={this.handleBlur}
                          />
                          {errors.gender && (
                            <FormFeedback className="d-block">{errors.gender}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col sm="8">
                        <FormGroup>
                          <Label for="birthday">Birthday</Label>
                          <div>
                            <DatePicker
                              value={values.birthday}
                              onChange={(value) => {
                                setFieldValue('birthday', value);
                              }}
                            />
                            { errors.birthday && <FormFeedback className="d-block">{errors.birthday}</FormFeedback> }
                          </div>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="email">Email</Label>
                          <Input
                            name="email"
                            type="email"
                            value={values.email || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.email}
                          />
                          {errors.email && (<FormFeedback className="d-block">{errors.email}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="mobile_phone">Mobile phone</Label>
                          <Input
                            name="mobile_phone"
                            type="phone"
                            value={values.mobile_phone || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.mobile_phone}
                          />
                          {errors.mobile_phone && (<FormFeedback className="d-block">{errors.mobile_phone}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="addressline1">Address Line1</Label>
                          <Input
                            name="addressline1"
                            type="text"
                            value={values.addressline1 || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.addressline1}
                          />
                          {errors.addressline1 && (<FormFeedback className="d-block">{errors.addressline1}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="addressline2">Address Line2</Label>
                          <Input
                            name="addressline2"
                            type="text"
                            value={values.addressline2 || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="country">Country</Label>
                          <Select
                            name="country"
                            classNamePrefix="react-select-lg"
                            indicatorSeparator={null}
                            options={countries}
                            getOptionValue={option => option.countryCode}
                            getOptionLabel={option => option.name}
                            value={values.country}
                            onChange={(value) => {
                              setFieldValue('country', value);
                            }}
                            onBlur={this.handleBlur}
                          />
                          {errors.country && (
                            <FormFeedback className="d-block">{errors.country}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="state">State</Label>
                          <Input
                            name="state"
                            type="text"
                            value={values.state || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.state}
                          />
                          {errors.state && (<FormFeedback className="d-block">{errors.state}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="city">City</Label>
                          <Input
                            name="city"
                            type="text"
                            value={values.city || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.city}
                          />
                          {errors.city && (<FormFeedback className="d-block">{errors.city}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="zip_code">Zip Code</Label>
                          <Input
                            name="zip_code"
                            type="text"
                            value={values.zip_code || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.zip_code}
                          />
                          {errors.zip_code && (<FormFeedback className="d-block">{errors.zip_code}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="4" xs="6">
                        <FormGroup>
                          <Label for="identity">Identity</Label>
                          <Input
                            name="identity"
                            type="text"
                            value={values.identity || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.identity}
                          />
                          <FormFeedback>{errors.identity}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="4" xs="6">
                        <FormGroup>
                          <Label for="weight">Weight</Label>
                          <Select
                            name="weight"
                            menuPlacement="top"
                            classNamePrefix="react-select-lg"
                            value={values.weight}
                            options={weights}
                            getOptionValue={option => option.id}
                            getOptionLabel={option => option.name}
                            onChange={(value) => {
                              setFieldValue('weight', value);
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="4" xs="6">
                        <FormGroup>
                          <Label for="dan">Dan</Label>
                          <Select
                            name="dan"
                            menuPlacement="top"
                            classNamePrefix="react-select-lg"
                            value={values.dan}
                            options={Dans}
                            getOptionValue={option => option.value}
                            getOptionLabel={option => option.label}
                            onChange={(value) => {
                              setFieldValue('dan', value);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <div className="w-100 d-flex justify-content-end">
                      <div>
                        <Button
                          disabled={isSubmitting}
                          type="submit"
                          color="primary"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
              />
            ) : (
              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  logo: null,
                  mobile_phone: '',
                  addressline1: '',
                  addressline2: '',
                  country: null,
                  state: '',
                  city: '',
                  zip_code: '',
                  level: '',
                  is_club: false
                }}
                validationSchema={
                  Yup.object().shape({
                    name: Yup.string().required('This field is required!'),
                    email: Yup.string().email('Email is not valid!').required('This field is required!'),
                    logo: Yup.mixed().required('Logo is required!'),
                    mobile_phone: Yup.string().min(10, 'Less than 10 characters!').required('This field is required!'),
                    addressline1: Yup.string().required('This field is required!'),
                    country: Yup.mixed().required('This field is required!'),
                    city: Yup.string().required('This field is required!'),
                    state: Yup.string().required('This field is required!'),
                    zip_code: Yup.string().required('This field is required!'),
                    level: Yup.string().required('This field is required!')
                  })
                }
                onSubmit={this.handleSubmit}
                render={({
                  values,
                  errors,
                  status,
                  setFieldValue,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    {status && <UncontrolledAlert {...status} />}
                    <Row>
                      <Col xs="12">
                        <FormGroup>
                          <Label for="logo">Logo Image</Label>

                          <FormFeedback>{errors.logo}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="name">
                            Organization Name
                          </Label>
                          <Input
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.name}
                          />
                          <FormFeedback>{errors.name}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="email">
                            Email
                          </Label>
                          <Input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.email}
                          />
                          <FormFeedback>{errors.email}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="4">
                        <FormGroup>
                          <Label for="mobile_phone">
                            Mobile Phone
                          </Label>
                          <Input
                            type="phone"
                            name="mobile_phone"
                            value={values.mobile_phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.mobile_phone}
                          />
                          <FormFeedback>{errors.mobile_phone}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="addressline1">
                            Address Line1
                          </Label>
                          <Input
                            type="text"
                            name="addressline1"
                            value={values.addressline1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.addressline1}
                          />
                          <FormFeedback>{errors.addressline1}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="addressline2">
                            Address Line2
                          </Label>
                          <Input
                            type="text"
                            name="addressline2"
                            value={values.addressline2}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.addressline2}
                          />
                          <FormFeedback>{errors.addressline2}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="country">Country</Label>
                          <Select
                            name="country"
                            classNamePrefix="react-select-lg"
                            indicatorSeparator={null}
                            options={countries}
                            getOptionValue={option => option.countryCode}
                            getOptionLabel={option => option.name}
                            value={values.country}
                            onChange={(value) => {
                              setFieldValue('country', value);
                            }}
                            onBlur={this.handleBlur}
                          />
                          {errors.country && (
                            <FormFeedback className="d-block">{errors.country}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="state">State</Label>
                          <Input
                            name="state"
                            type="text"
                            value={values.state || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.state}
                          />
                          {errors.state && (<FormFeedback className="d-block">{errors.state}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="city">City</Label>
                          <Input
                            name="city"
                            type="text"
                            value={values.city || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.city}
                          />
                          {errors.city && (<FormFeedback className="d-block">{errors.city}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="3" xs="6">
                        <FormGroup>
                          <Label for="zip_code">Zip Code</Label>
                          <Input
                            name="zip_code"
                            type="text"
                            value={values.zip_code || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.zip_code}
                          />
                          {errors.zip_code && (<FormFeedback className="d-block">{errors.zip_code}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col xs="4">
                        <FormGroup>
                          <Label for="level">Level</Label>
                          <Input
                            name="level"
                            type="text"
                            value={values.level || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.level}
                          />
                          {errors.level && (<FormFeedback className="d-block">{errors.level}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col xs="4">
                        <FormGroup>
                          <Label for="is_club">Has Club</Label>
                          <CustomInput
                            id="is_club"
                            type="checkbox"
                            label={values.is_club ? 'Yes' : 'NO'}
                            onChange={(event) => { this.handleCheckbox.bind(this, event.target.checked); }}
                            checked={values.is_club}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <div className="w-100 d-flex justify-content-end">
                      <div>
                        <Button
                          disabled={isSubmitting}
                          type="submit"
                          color="primary"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </Form>
                )}
              />
            )
          }
        </ModalBody>
      </Modal>
    );
  }
}

export default EditModal;

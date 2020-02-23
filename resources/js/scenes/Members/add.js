/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import moment from 'moment';
import * as Yup from 'yup';
import {
  Container,
  Row, Col,
  Button,
  Form, FormGroup, FormFeedback,
  Input, Label,
  UncontrolledAlert
} from 'reactstrap';
import Select from 'react-select';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';
import {
  countries, Genders, Dans
} from '../../configs/data';

class MemberAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: '',
      fileKey: 1,
      org_list: [],
      weights: [],
      roles: []
    };
    this.fileRef = React.createRef();
    this.formikRef = React.createRef();
  }

  componentDidMount() {
    this.componentWillReceiveProps();
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
    const weight_lists = JSON.parse(localStorage.getItem('weights'));
    if (weight_lists && weight_lists.length > 0) {
      this.setState({
        weights: weight_lists
      });
    } else {
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


  fileUpload(e) {
    e.preventDefault();
    const reader = new FileReader();
    // eslint-disable-next-line prefer-const
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file,
        imagePreviewUrl: reader.result
      });
    };

    reader.readAsDataURL(file);
  }

  async handleSubmit(values, bags) {
    let newData = {};
    const { file } = this.state;
    newData = {
      first_name: values.first_name,
      mid_name: values.mid_name,
      last_name: values.last_name,
      gender: values.gender.id,
      birthday: moment(values.birthday).format('YYYY-MM-DD'),
      email: values.email,
      mobile_phone: values.mobile_phone,
      addressline1: values.addressline1,
      addressline2: values.addressline2,
      country: values.country.countryCode,
      state: values.state,
      city: values.city,
      zip_code: values.zip_code,
      weight_id: values.weight_id ? values.weight_id.id : 0,
      dan: values.dan ? values.dan.value : 0,
      identity: values.identity,
      organization_id: values.organization_id.id,
      role_id: values.role_id.id,
      profile_image: file || '',
      position: values.position,
      skill: values.skill ? values.skill : '',
      active: values.is_club || 0,
      register_date: moment(values.register_date).format('YYYY-MM-DD')
    };

    const data = await Api.post('register-member', newData);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.props.history.goBack();
        break;
      case 406:
        if (body.message) {
          bags.setStatus({
            color: 'danger',
            children: body.message
          });
        }
        bags.setErrors(body.errors);
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
  }


  render() {
    const {
      imagePreviewUrl,
      org_list,
      roles,
      weights
    } = this.state;

    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container>
            <Formik
              ref={this.formikRef}
              initialValues={{
                organization_id: null,
                role_id: null,
                profile_image: null,
                register_date: null,
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
                weight_id: null,
                dan: null,
                position: '',
                skill: ''
              }}
              validationSchema={
                Yup.object().shape({
                  organization_id: Yup.mixed().required('This field is required!'),
                  role_id: Yup.mixed().required('This field is required!'),
                  // profile_image: Yup.mixed().required('Image is required!'),
                  register_date: Yup.mixed().required('This field is required!'),
                  first_name: Yup.string().required('This field is required!'),
                  last_name: Yup.string().required('This field is required!'),
                  gender: Yup.mixed().required('This field is required!'),
                  birthday: Yup.mixed().required('This field is required!'),
                  email: Yup.string().email('Email is not valid!').required('This field is required!'),
                  mobile_phone: Yup.string().matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Mobile phone is incorrect!').required('This field is required!'),
                  addressline1: Yup.string().required('This field is required!'),
                  country: Yup.mixed().required('This field is required!'),
                  city: Yup.string().required('This field is required!'),
                  state: Yup.string().required('This field is required!'),
                  zip_code: Yup.string().max(6, 'Less than 6 characters!').required('This field is required!'),
                  identity: Yup.string().required('This field is required!')
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
                    <Col sm="8">
                      <FormGroup>
                        <Label for="organization_id">
                          Organization
                        </Label>
                        <Select
                          name="organization_id"
                          classNamePrefix={errors.organization_id ? 'invalid react-select-lg' : 'react-select-lg'}
                          indicatorSeparator={null}
                          options={org_list}
                          getOptionValue={option => option.id}
                          getOptionLabel={option => option.name}
                          value={values.organization_id}
                          invalid={!!errors.organization_id && touched.organization_id}
                          onChange={(value) => {
                            setFieldValue('organization_id', value);
                          }}
                          onBlur={this.handleBlur}
                        />
                        {!!errors.organization_id && touched.organization_id && (
                          <FormFeedback className="d-block">{errors.organization_id}</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="role_id">Role</Label>
                        <Select
                          name="role_id"
                          classNamePrefix={errors.role_id ? 'invalid react-select-lg' : 'react-select-lg'}
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
                        {!!errors.role_id && touched.role_id && (
                          <FormFeedback className="d-block">{errors.role_id}</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col xs="6">
                      <FormGroup>
                        <Label for="profile_image">Profile Image</Label>
                        <Input
                          ref="file"
                          type="file"
                          key={this.state.fileKey}
                          multiple={false}
                          onChange={this.fileUpload.bind(this)}
                        />
                        <div className="image-preview">
                          {$imagePreview}
                        </div>
                      </FormGroup>
                    </Col>
                    <Col xs="6">
                      <FormGroup>
                        <Label for="register_date">Register Date</Label>
                        <Input
                          name="register_date"
                          type="date"
                          placeholder="YYYY-MM-DD"
                          value={values.register_date || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.register_date && touched.register_date}
                        />
                        {!!errors.register_date && touched.register_date && <FormFeedback className="d-block">{errors.register_date}</FormFeedback> }
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
                          invalid={!!errors.first_name && touched.first_name}
                        />
                        <FormFeedback>{errors.first_name}</FormFeedback>
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
                          invalid={!!errors.last_name && touched.last_name}
                        />
                        <FormFeedback>{errors.last_name}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="gender">Gender</Label>
                        <Select
                          name="gender"
                          classNamePrefix={errors.gender ? 'invalid react-select-lg' : 'react-select-lg'}
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
                        {!!errors.gender && touched.gender && (
                          <FormFeedback className="d-block">{errors.gender}</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="8">
                      <FormGroup>
                        <Label for="birthday">Birthday</Label>
                        <Input
                          name="birthday"
                          type="date"
                          placeholder="YYYY-MM-DD"
                          value={values.birthday || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.birthday}
                        />
                        {!!errors.birthday && touched.birthday && <FormFeedback className="d-block">{errors.birthday}</FormFeedback> }
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
                          invalid={!!errors.email && touched.email}
                        />
                        <FormFeedback>{errors.email}</FormFeedback>
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
                          invalid={!!errors.mobile_phone && touched.mobile_phone}
                        />
                        <FormFeedback>{errors.mobile_phone}</FormFeedback>
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
                          invalid={!!errors.addressline1 && touched.addressline1}
                        />
                        <FormFeedback>{errors.addressline1}</FormFeedback>
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
                          classNamePrefix={errors.country ? 'invalid react-select-lg' : 'react-select-lg'}
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
                        {!!errors.country && touched.country && (
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
                          invalid={!!errors.state && touched.state}
                        />
                        <FormFeedback>{errors.state}</FormFeedback>
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
                          invalid={!!errors.city && touched.city}
                        />
                        <FormFeedback>{errors.city}</FormFeedback>
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
                          invalid={!!errors.zip_code && touched.zip_code}
                        />
                        <FormFeedback>{errors.zip_code}</FormFeedback>
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
                          invalid={!!errors.identity && touched.identity}
                        />
                        <FormFeedback>{errors.identity}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col sm="4" xs="6">
                      {
                        values.role_id && values.role_id.id === 3 && (
                          <FormGroup>
                            <Label for="weight_id">Weight</Label>
                            <Select
                              name="weight_id"
                              menuPlacement="top"
                              classNamePrefix={errors.weight_id ? 'invalid react-select-lg' : 'react-select-lg'}
                              value={values.weight_id}
                              options={weights}
                              getOptionValue={option => option.id}
                              getOptionLabel={option => option.name}
                              onChange={(value) => {
                                setFieldValue('weight_id', value);
                              }}
                            />
                            {!!errors.weight_id && touched.weight_id && values.role_id && values.role_id.id === 3 && (
                              <FormFeedback className="d-block">{errors.weight_id}</FormFeedback>
                            )}
                          </FormGroup>
                        )
                      }
                    </Col>
                    <Col sm="4" xs="6">
                      {
                        values.role_id && values.role_id.id === 3 && (
                          <FormGroup>
                            <Label for="dan">Dan</Label>
                            <Select
                              name="dan"
                              menuPlacement="top"
                              classNamePrefix={errors.dan ? 'invalid react-select-lg' : 'react-select-lg'}
                              value={values.dan}
                              options={Dans}
                              getOptionValue={option => option.value}
                              getOptionLabel={option => option.label}
                              onChange={(value) => {
                                setFieldValue('dan', value);
                              }}
                            />
                            {!!errors.dan && touched.dan && values.role_id && values.role_id.id === 3 && (
                              <FormFeedback className="d-block">{errors.dan}</FormFeedback>
                            )}
                          </FormGroup>
                        )
                      }
                    </Col>
                    <Col xs="6">
                      <FormGroup>
                        <Label for="position">Position</Label>
                        <Input
                          name="position"
                          type="text"
                          value={values.position || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="6">
                      <FormGroup>
                        <Label for="skill">Skill</Label>
                        <Input
                          name="skill"
                          type="text"
                          value={values.skill || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
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
                        Register Member
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            />
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default MemberAdd;
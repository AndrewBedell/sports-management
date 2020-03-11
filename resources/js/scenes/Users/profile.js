/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import moment from 'moment';
import * as Yup from 'yup';
import {
  Container, Row, Col,
  Form, FormGroup, FormFeedback,
  Button, Input, Label,
  UncontrolledAlert,
  Alert
} from 'reactstrap';
import Select from 'react-select';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

import { Genders } from '../../configs/data';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      imagePreviewUrl: '',
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: ''
    };
    this.formikRef = React.createRef();
  }

  async componentDidMount() {
    const data = await Api.get('profile');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          item: body,
          imagePreviewUrl: body.profile_image
        });
        break;
      case 406:
        break;
      default:
        break;
    }
    this.settingValues();
  }

  settingValues() {
    const {
      item
    } = this.state;
    const {
      formikRef
    } = this;
    const values = item;

    formikRef.current.setValues({
      id: values.id,
      role_id: values.role_id,
      organization_id: values.organization_id,
      name: values.name,
      patronymic: values.patronymic,
      surname: values.surname,
      gender: values.gender == 1 ? Genders[0] : Genders[1],
      profile_image: values.profile_image,
      register_date: values.register_date,
      birthday: values.birthday,
      email: values.email,
      mobile_phone: values.mobile_phone,
      addressline1: values.addressline1,
      addressline2: values.addressline2,
      // country: countries.filter(country => country.countryCode === values.country)[0],
      state: values.state,
      city: values.city,
      zip_code: values.zip_code,
      parent_id: values.parent_id,
      identity: values.identity
    });
  }

  fileUpload(e) {
    e.preventDefault();
    const reader = new FileReader();
    // eslint-disable-next-line prefer-const
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        // file,
        imagePreviewUrl: reader.result
      });
    };

    reader.readAsDataURL(file);
  }

  async handleSubmit(values, bags) {
    let newData = {};
    const { imagePreviewUrl } = this.state;
    newData = {
      id: values.id,
      organization_id: values.organization_id,
      role_id: values.role_id,
      name: values.name,
      patronymic: values.patronymic,
      surname: values.surname,
      gender: values.gender.id,
      profile_image: imagePreviewUrl || '',
      birthday: moment(values.birthday).format('YYYY-MM-DD'),
      email: values.email,
      mobile_phone: values.mobile_phone,
      addressline1: values.addressline1,
      addressline2: values.addressline2,
      // country: values.country.countryCode,
      state: values.state,
      city: values.city,
      zip_code: values.zip_code,
      register_date: values.register_date,
      position: values.position || '',
      identity: values.identity
    };

    const data = await Api.put(`member/${values.id}`, newData);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          successMessage: 'Updated Successfully!'
        });

        setTimeout(() => {
          this.setState({ alertVisible: false });
        }, 2000);
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
      case 422:
        this.setState({
          alertVisible: true,
          messageStatus: false,
          failMessage: body.data && (`${body.data.email !== undefined ? body.data.email : ''} ${body.data.identity !== undefined ? body.data.identity : ''}`)
        });
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  render() {
    const {
      imagePreviewUrl
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
                organization_id: null,
                register_date: '',
                profile_image: null,
                name: '',
                patronymic: '',
                surname: '',
                gender: null,
                birthday: null,
                email: '',
                mobile_phone: '',
                addressline1: '',
                addressline2: '',
                // country: null,
                state: '',
                city: '',
                zip_code: '',
                identity: ''
              }}

              validationSchema={
                Yup.object().shape({
                  // profile_image: Yup.mixed().required('Image is required!'),
                  name: Yup.string().required('This field is required!'),
                  surname: Yup.string().required('This field is required!'),
                  gender: Yup.mixed().required('This field is required!'),
                  birthday: Yup.mixed().required('This field is required!'),
                  mobile_phone: Yup.string().matches(/^\+?[0-9]\s?[-]\s|[0-9]$/, 'Mobile phone is incorrect!').required('This field is required!'),
                  addressline1: Yup.string().required('This field is required!'),
                  // country: Yup.mixed().required('This field is required!'),
                  city: Yup.string().required('This field is required!'),
                  state: Yup.string().required('This field is required!'),
                  zip_code: Yup.string().required('This field is required!'),
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
                    <Col xs="12" sm="6">
                      <FormGroup>
                      <Label for="profile_image">Profile Image</Label>
                        <Input
                          ref="file"
                          type="file"
                          key={this.state.fileKey}
                          multiple={false}
                          onChange={this.fileUpload.bind(this)}
                        />
                        <div className={imagePreviewUrl ? 'image-preview is_image' : 'image-preview'}>
                          {$imagePreview}
                        </div>
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label>Register Date</Label>
                        <Input
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={values.register_date}
                          disabled
                        />
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="name">
                          Name
                        </Label>
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
                    <Col sm="4">
                      <FormGroup>
                        <Label for="patronymic">
                          Patronymic
                        </Label>
                        <Input
                          name="patronymic"
                          type="text"
                          value={values.patronymic || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="surname">
                          Surname
                        </Label>
                        <Input
                          name="surname"
                          type="text"
                          value={values.surname || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.surname && touched.surname}
                        />
                        <FormFeedback className="d-block">{errors.surname}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="gender">Gender</Label>
                        <Select
                          name="gender"
                          classNamePrefix={!!errors.gender && touched.gender ? 'invalid react-select-lg' : 'react-select-lg'}
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
                    <Col sm="4">
                      <FormGroup>
                        <Label for="birthday">Birthday</Label>
                        <Input
                          name="birthday"
                          type="date"
                          placeholder="YYYY-MM-DD"
                          value={values.birthday || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.birthday && touched.birthday}
                        />
                        {!!errors.birthday && touched.birthday && <FormFeedback className="d-block">{errors.birthday}</FormFeedback> }
                      </FormGroup>
                    </Col>
                    <Col sm="4">
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
                        {!!errors.email && touched.email && (<FormFeedback className="d-block">{errors.email}</FormFeedback>)}
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
                        {!!errors.mobile_phone && touched.mobile_phone && (
                        <FormFeedback className="d-block">{errors.mobile_phone}</FormFeedback>)}
                      </FormGroup>
                    </Col>
                    <Col sm="6">
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
                        {!!errors.identity && touched.identity && (
                        <FormFeedback className="d-block">{errors.identity}</FormFeedback>)}
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
                        {!!errors.addressline1 && touched.addressline1 && (<FormFeedback className="d-block">{errors.addressline1}</FormFeedback>)}
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
                    {/* <Col sm="3" xs="6">
                      <FormGroup>
                        <Label for="country">Country</Label>
                        <Select
                          name="country"
                          classNamePrefix={!!errors.country && touched.country ? 'invalid react-select-lg' : 'react-select-lg'}
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
                    </Col> */}
                    <Col sm="6">
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
                        {!!errors.city && touched.city && (<FormFeedback className="d-block">{errors.city}</FormFeedback>)}
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
                        {!!errors.state && touched.state && (<FormFeedback className="d-block">{errors.state}</FormFeedback>)}
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
                        {!!errors.zip_code && touched.zip_code && (<FormFeedback className="d-block">{errors.zip_code}</FormFeedback>)}
                      </FormGroup>
                    </Col>
                  </Row>
                  <hr/>              
                  <div className="w-100 d-flex justify-content-end">
                    <div>
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        color="primary"
                      >
                        Update Profile
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

export default Profile;

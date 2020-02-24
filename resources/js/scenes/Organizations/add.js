/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Formik } from 'formik';
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
  countries, SetSwitch
} from '../../configs/data';

class OrganizationAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      org_list: [],
      file: '',
      imagePreviewUrl: '',
      fileKey: 1
    };
    this.fileRef = React.createRef();
    this.formikRef = React.createRef();
    this.getLevel = this.getLevel.bind(this);
  }

  async componentDidMount() {
    const org_response = await Api.get('organizations-list', {
      contain_self: 1,
      contain_club: 0
    });
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
  }

  getLevel(parent_id) {
    const { org_list } = this.state;
    for (let i = 0; i < org_list.length; i++) {
      if (org_list[i].id === parent_id) {
        return org_list[i].level + 1;
      }
    }
    return 2;
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
    const { imagePreviewUrl } = this.state;
    newData = {
      parent_id: parseInt(values.parent_id, 10) || 1,
      name: values.name,
      register_no: values.register_no,
      logo: imagePreviewUrl || '',
      email: values.email,
      mobile_phone: values.mobile_phone,
      addressline1: values.addressline1,
      addressline2: values.addressline2,
      country: values.country.countryCode,
      state: values.state,
      city: values.city,
      zip_code: values.zip_code,
      level: this.getLevel(values.parent_id),
      readable_id: values.readable_id,
      is_club: values.is_club ? values.is_club.value : 0
    };

    const data = await Api.post('register-organization', newData);
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
    const { imagePreviewUrl, org_list } = this.state;

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
                parent_id: '',
                name: '',
                register_no: '',
                email: '',
                logo: null,
                mobile_phone: '',
                addressline1: '',
                addressline2: '',
                country: null,
                state: '',
                city: '',
                zip_code: '',
                readable_id: '',
                is_club: false
              }}
              validationSchema={
                Yup.object().shape({
                  parent_id: Yup.mixed().required('Federation is required'),
                  name: Yup.string().required('This field is required!'),
                  register_no: Yup.string().required('This field is required!'),
                  email: Yup.string().email('Email is not valid!').required('This field is required!'),
                  // logo: Yup.mixed().required('Logo is required!'),
                  mobile_phone: Yup.string().matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Mobile phone is incorrect!').required('This field is required!'),
                  addressline1: Yup.string().required('This field is required!'),
                  country: Yup.mixed().required('This field is required!'),
                  city: Yup.string().required('This field is required!'),
                  state: Yup.string().required('This field is required!'),
                  zip_code: Yup.string().max(6, 'Less than 5 characters!').required('This field is required!'),
                  readable_id: Yup.string().required('This field is required!')
                })
              }
              onSubmit={this.handleSubmit.bind(this)}
              render={({
                values,
                errors,
                touched,
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
                    <Col xs="6">
                      <FormGroup>
                        <Label for="logo">Logo Image</Label>
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
                    <Col xs="6">
                      <FormGroup>
                        <Label for="register_no">
                          Register Number
                        </Label>
                        <Input
                          type="text"
                          name="register_no"
                          value={values.register_no}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.register_no && touched.register_no}
                        />
                        <FormFeedback>{errors.register_no}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label for="parent_id">
                          Federation
                        </Label>
                        <Select
                          name="parent_id"
                          classNamePrefix={!!errors.parent_id && touched.parent_id ? 'invalid react-select-lg' : 'react-select-lg'}
                          indicatorSeparator={null}
                          options={org_list}
                          getOptionValue={option => option.id}
                          getOptionLabel={option => option.name}
                          value={values.parent_id}
                          invalid={!!errors.parent_id && touched.parent_id}
                          onChange={(value) => {
                            setFieldValue('parent_id', value);
                          }}
                          onBlur={this.handleBlur}
                        />
                        {!!errors.parent_id && touched.parent_id && (
                          <FormFeedback className="d-block">{errors.parent_id}</FormFeedback>
                        )}
                      </FormGroup>
                    </Col>
                    <Col sm="6">
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
                          invalid={!!errors.name && touched.name}
                        />
                        <FormFeedback>{errors.name}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col sm="6">
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
                          invalid={!!errors.email && touched.email}
                        />
                        <FormFeedback>{errors.email}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col sm="6">
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
                          invalid={!!errors.mobile_phone && touched.mobile_phone}
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
                          invalid={!!errors.addressline1 && touched.addressline1}
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
                        />
                      </FormGroup>
                    </Col>
                    <Col sm="3" xs="6">
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
                    <Col xs="6">
                      <FormGroup>
                        <Label for="readable_id">ID</Label>
                        <Input
                          name="readable_id"
                          type="text"
                          value={values.readable_id || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={!!errors.readable_id && touched.readable_id}
                        />
                        {!!errors.readable_id && touched.readable_id && (<FormFeedback className="d-block">{errors.readable_id}</FormFeedback>)}
                      </FormGroup>
                    </Col>
                    <Col xs="6">
                      <FormGroup>
                        <Label for="is_club">Is Club</Label>
                        <Select
                          name="is_club"
                          classNamePrefix="react-select-lg"
                          indicatorSeparator={null}
                          options={SetSwitch}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          value={values.is_club}
                          onChange={(value) => {
                            setFieldValue('is_club', value);
                          }}
                          onBlur={this.handleBlur}
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
                        Create Organization
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

export default withRouter(OrganizationAdd);

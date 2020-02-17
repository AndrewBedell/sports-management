import React, {
  Component, Fragment
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import {
  Form, FormGroup, Input, Button, Alert
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Layout from '../../layouts/Auth';

import Api from '../../apis/app';
import {
  login
} from '../../actions/common';
import AppHelper from '../../helpers/AppHelper';

class Register extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.formikRef = React.createRef();
  }

  async handleSubmit(values, bags) {
    const data = await Api.post('register', values);
    const { response, body } = data;
    switch (response.status) {
      case 422:
        bags.setErrors(body.data);
        break;
      case 406:
        bags.setStatus(AppHelper.getStatusAlertData(body));
        break;
      case 200:
        this.login(body.data);
        break;
      default:
        break;
    }
    bags.setSubmitting(false);
  }

  async login(auth) {
    await this.props.login(auth);
    this.props.history.push('/');
  }

  render() {
    return (
      <Layout
        header={(
          <Fragment>
            <div>Already have an account?</div>
            <Button type="button" color="success" onClick={() => this.props.history.push('/login')}>
              Login
            </Button>
          </Fragment>
        )}
        form={(
          <Formik
            initialValues={{
              name: '',
              email: '',
              business_name: '',
              password: '',
              password_confirmation: ''
            }}
            validationSchema={
              Yup.object().shape({
                name: Yup.string().required('Name is required!'),
                email: Yup.string().email('Email is not valid!').required('Email is required!'),
                business_name: Yup.string().required('Business Name is required!'),
                password: Yup.string().min(6, 'Password has to be longer than 6 characters!').required('Password is required!'),
                password_confirmation: Yup.string()
                  .min(8, 'Password has to be longer than 8 characters!')
                  .oneOf([Yup.ref('password'), null], 'Confirm Password must match!')
                  .required('Confirm Password is required!')
              })
            }
            onSubmit={this.handleSubmit}
            render={({
              values,
              errors,
              status,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting
            }) => (
              <Form className="intro-box-form-field" onSubmit={handleSubmit}>
                {status && <Alert {...status} />}
                {
                  <ul className="alert alert-danger">
                    {touched.name && !!errors.name && (
                    <li>
                      {touched.name && errors.name}
                    </li>
                    )}
                    {touched.email && !!errors.email && (
                      <li>
                        {touched.email && errors.email}
                      </li>
                    )}
                    {touched.business_name && !!errors.business_name && (
                      <li>
                        {touched.business_name && errors.business_name}
                      </li>
                    )}
                    {touched.password && !!errors.password && (
                      <li>
                        {touched.password && errors.password}
                      </li>
                    )}
                    {touched.password_confirmation && !!errors.password_confirmation && (
                      <li>
                        {touched.password_confirmation && errors.password_confirmation}
                      </li>
                    )}
                  </ul>
                }
                <div className="form-fields">
                  <FormGroup>
                    <Input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={touched.name && !!errors.name}
                    />
                    <i className="fa fa-signature" />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={touched.email && !!errors.email}
                    />
                    <i className="far fa-mail-bulk" />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="text"
                      name="business_name"
                      id="business_name"
                      placeholder="Business Name"
                      value={values.business_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={touched.business_name && !!errors.business_name}
                    />
                    <i className="far fa-store" />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={touched.password && !!errors.password}
                    />
                    <i className="fa fa-fingerprint" />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      type="password"
                      name="password_confirmation"
                      id="password_confirmation"
                      placeholder="Confirm Password"
                      value={values.password_confirmation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={touched.password_confirmation && !!errors.password_confirmation}
                    />
                    <i className="fa fa-check-double" />
                  </FormGroup>
                </div>
                <div className="form-links">
                  <FormGroup className="text-center">
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      color="success"
                      className="btn-lg"
                    >
                      {
                        isSubmitting && (
                          <Fragment>
                            <span className="fa fa-spinner fa-spin" />
                            &nbsp;&nbsp;
                          </Fragment>
                        )
                      }
                      Signup
                    </Button>
                  </FormGroup>
                </div>
              </Form>
            )}
          />
        )}
      />
    );
  }
}
const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  login: bindActionCreators(login, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Register));

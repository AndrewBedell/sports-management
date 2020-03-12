/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Row, Col,
  Form, FormGroup, FormFeedback,
  Button, Input, Label,
  UncontrolledAlert,
  InputGroup, InputGroupAddon,
  Alert
} from 'reactstrap';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

class Setting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: ''
    };
    this.formikRef = React.createRef();
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
    this.settingValues();
  }

  settingValues() {
    // const {
    //   items
    // } = this.state;
    // const {
    //   formikRef
    // } = this;
    // const values = items;

    // formikRef.current.setValues({
    //   organization_id: values.organization_id,
    //   price: values.price,
    //   percent: values.percent
    // });
  }

  async handleSubmit(values, bags) {
    let newData = {};
    
    newData = {
      organization_id: values.organization_id,
      price: values.price,
      percent: values.percent
    };

    const data = await Api.put(`setting/${values.id}`, newData);
    const { response } = data;
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
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  render() {

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
                price: 1,
                percent: 0
              }}

              validationSchema={
                Yup.object().shape({
                  price: Yup.string().matches(/^[+-]?([0-9]*[.])?[0-9]+$/, 'price is only number.')
                        .required('This field is required.'),
                  percent: Yup.string().matches(/^[+-]?([0-9]*[.])?[0-9]+$/, 'price is only number.')
                        .required('This field is required.')
                })
              }

              onSubmit={this.handleSubmit.bind(this)}

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
                <Form onSubmit={handleSubmit}>
                  {status && <UncontrolledAlert {...status} />}
                  <Row className="align-items-center">
                    <Col sm="4">
                      <FormGroup>
                        <Label for="price">Membership Price per Judoka</Label>
                        <InputGroup>
                          <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                          <Input 
                            name="price"
                            type="text"
                            placeholder="price" 
                            value={values.price || 1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.price && touched.price}
                          />
                          <FormFeedback>{errors.price}</FormFeedback>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <FormGroup>
                        <Label for="percent">Percentage of Membership</Label>
                        <InputGroup>
                          <Input 
                            name="percent"
                            className="text-right"
                            type="text"
                            placeholder="percent" 
                            value={values.percent || 0}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.percent && touched.percent}
                          />
                          <InputGroupAddon addonType="append">%</InputGroupAddon>
                          <FormFeedback>{errors.percent}</FormFeedback>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col sm="4">
                      <div className="mt-2">
                        <Button
                          disabled={isSubmitting}
                          type="submit"
                          color="primary"
                        >
                          Update Setting
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              )}
            />
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default Setting;

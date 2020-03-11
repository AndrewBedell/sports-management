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
  InputGroup, InputGroupAddon,
  Alert
} from 'reactstrap';
import MainTopBar from '../../components/TopBar/MainTopBar';
import Api from '../../apis/app';

class Reset extends Component {
  constructor(props) {
    super(props);
    
  }

  render() {
    
    return (
      <Fragment>
        <MainTopBar />
        <div className="main-content">
          <Container>
            
          </Container>
        </div>
      </Fragment>
    );
  }
}

export default Reset;

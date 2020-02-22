/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import $ from 'jquery';
import 'daterangepicker';
import classnames from 'classnames';

import Icon from '../Utilities/Icon';
import { Svgs } from '../../theme';

class DateRangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.ref = React.createRef();
    this.datepicker = null;
    this.handleChange = this.handleChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidMount() {
    const {
      options, format
    } = this.props;
    const newOptions = {
      ...options,
      autoUpdateInput: false,
      locale: {
        format
      }
    };
    const {
      startDate, endDate
    } = options;
    if (options.singleDatePicker) {
      if (startDate) {
        this.ref.current.value = `${startDate.format(format)}`;
      }
    } else if (startDate && endDate) {
      this.ref.current.value = `${startDate.format(format)} - ${endDate.format(format)}`;
    }
    this.datepicker = $(this.ref.current).daterangepicker(newOptions)
      .on('apply.daterangepicker', this.handleChange)
      .on('cancel.daterangepicker', this.handleCancel);
  }

  componentWillReceiveProps(props) {
    const { clear, options, format } = props;
    if (clear === 'true') {
      this.ref.current.value = '';
      options.startDate = '';
      options.endDate = '';
    } else if (options.singleDatePicker) {
      if (options.startDate) {
        this.ref.current.value = `${options.startDate.format(format)}`;
      }
    } else if (options.startDate && options.endDate) {
      this.ref.current.value = `${options.startDate.format(format)} - ${options.endDate.format(format)}`;
    }
  }

  handleChange(event, picker) {
    const {
      onChange, format, options
    } = this.props;

    if (options.singleDatePicker) {
      if (picker && picker.startDate) {
        this.ref.current.value = `${picker.startDate.format(format)}`;
      }
    } else if (picker && picker.startDate && picker.endDate) {
      this.ref.current.value = `${picker.startDate.format(format)} - ${picker.endDate.format(format)}`;
    }
    onChange(picker);
  }

  handleCancel(event, picker) {
    const {
      onChange, options, format
    } = this.props;
    if (!picker) {
      this.ref.current.value = '';
      onChange({});
    } else {
      if (options.singleDatePicker) {
        if (picker && picker.startDate) {
          this.ref.current.value = `${picker.startDate.format(format)}`;
        }
      } else if (picker && picker.startDate && picker.endDate) {
        this.ref.current.value = `${picker.startDate.format(format)} - ${picker.endDate.format(format)}`;
      }
      onChange(picker);
    }
  }

  render() {
    const {
      containerClassName, className, options, onChange, placeholder, ...rest
    } = this.props;

    const containerClassNameMap = {
      'daterangepicker-container': true,
      ...(containerClassName ? { [containerClassName]: true } : {})
    };

    const classNameMap = {
      'daterangepicker-input': true,
      ...(className ? { [className]: true } : {})
    };

    return (
      <div className={classnames(containerClassNameMap)}>
        <input type="text" placeholder={placeholder} ref={this.ref} className={classnames(classNameMap)} {...rest} />
        {
          options.singleDatePicker ? (
            <Icon source={Svgs.iconCalendar} className="daterangepicker-icon" onClick={() => { this.datepicker.trigger('click'); }} />
          ) : (
            !options.startDate && !options.endDate ? (
              <Icon source={Svgs.iconCalendar} className="daterangepicker-icon" onClick={() => { this.datepicker.trigger('click'); }} />
            ) : (
              <Icon source={Svgs.iconCloseCircleSolid} className="daterangepicker-icon" onClick={() => { this.handleCancel(); this.handleChange(); }} />
            )
          )
        }
      </div>
    );
  }
}

DateRangePicker.defaultProps = {
  onChange: () => {},
  format: 'YYYY-MM-DD',
  clear: 'false'
};

export default DateRangePicker;

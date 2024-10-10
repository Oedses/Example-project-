import { ChangeEvent } from 'react';
import classnames from 'classnames';
import {
  ChangedEventArgs,
  DatePickerComponent as DatePicker,
  Inject,
   MaskedDateTime
  } from '@syncfusion/ej2-react-calendars';
// import { SingleDatePicker } from "react-google-flight-datepicker";
// import "react-google-flight-datepicker/dist/main.css";


import { DateUtils } from './datepicker.utils';
import {
  dayMonthPlaceholder,
  yearPlaceholder,
  calendarFormat
} from './datepicker.constants';

import './datepicker.scss';



export type DatePickerProps = {
  date: Date | undefined
  className?: string
  label?: string
  placeholder?: string
  errorMessage?: string
  // onChange: (date: Date | undefined) => void
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  minDate?: Date | undefined
  maxDate?: Date | undefined
  disabled?: boolean
};

const DatePickerComponent = ({
  className,
  errorMessage,
  onChange,
  minDate,
  maxDate,
  date,
  disabled,
  label
}: DatePickerProps) => {
  const datePickerClassnames = classnames("datepicker-container", className, {
    "datepicker-container__with-error": errorMessage
  });

  const maskPlaceholder = {
    day: '__',
    month: '__',
    year: '____'
  };

  const onChangeEvents = {
    onChange,
    change: (event: ChangedEventArgs) => onChange(({ target: { value: event?.value?.toString() } }) as ChangeEvent<HTMLInputElement>)
  };

  return (
    <div className={datePickerClassnames}>
      {label && <label className=" label">{label}</label>}

       <div>
        <DatePicker
          value={date}
          { ...onChangeEvents }
          min={minDate || DateUtils.minDate}
          max={maxDate || DateUtils.maxDate}
          placeholder={`${dayMonthPlaceholder}-${dayMonthPlaceholder}-${yearPlaceholder}`}
          disabled={disabled}
          onChange={onChange}
          showTodayButton
          format={calendarFormat}
          maskPlaceholder={maskPlaceholder}
          openOnFocus
          enableMask={true}
          strictMode={true}
        >
          <Inject services={[MaskedDateTime]} />
        </DatePicker>
       </div>


      {errorMessage && (
        <span className="datepicker__error">{errorMessage}</span>
      )}
    </div>
  );
};

export default DatePickerComponent;

import React from 'react';

import BigNumber from 'bignumber.js';
import styled from 'styled-components';

import { getFormattedNumber, NumberStyle } from 'utils/formatter';

export interface TimePeriod {
  displayText: string;
  days: number;
}

interface TimePeriods {
  [key: string]: TimePeriod;
}

interface DateOptions {
  month: 'numeric' | 'short' | '2-digit' | 'long' | 'narrow' | undefined;
  day: any;
  year?: any;
}

export interface FormattedPeriods {
  [key: string]: {
    dateStart: string;
    dateEnd: string;
  };
}

export const dateOptionShort: DateOptions = {
  month: 'short',
  day: '2-digit',
};

export const dateOptionLong: DateOptions = {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
};

export const earningPeriods: TimePeriods = {
  day: {
    displayText: 'day',
    days: 1,
  },
  week: {
    displayText: 'week',
    days: 7,
  },
  month: {
    displayText: 'month',
    days: 30,
  },
  twoMonths: {
    displayText: 'two months',
    days: 60,
  },
};

const Loader = styled.span`
  @keyframes blink {
    0% {
      opacity: 0;
      transform: scale(0.4);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0.4);
    }
  }

  span {
    animation: blink 2s infinite;
    display: inline-flex;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #ffffff;
    margin-left: 3px;
  }

  span:nth-of-type(1) {
    animation-delay: 100ms;
  }
  span:nth-of-type(2) {
    animation-delay: 250ms;
  }
  span:nth-of-type(3) {
    animation-delay: 400ms;
  }
`;

export const getTimestampFrom = (from: number = 0): number => {
  const date = new Date();
  return date.setDate(date.getDate() - from) * 1_000;
};

export const displayValueOrLoader = (value: number | BigNumber | undefined, format: NumberStyle = 'currency2') => {
  if (value !== undefined) {
    return typeof value === 'number'
      ? getFormattedNumber(value, 'currency0')
      : getFormattedNumber(value.integerValue().toNumber(), format);
  } else {
    return (
      <Loader>
        <span></span>
        <span></span>
        <span></span>
      </Loader>
    );
  }
};

export const DatePickerWrap = styled.div`
  display: inline-flex;
  margin-left: auto;

  .react-datepicker {
    border: 2px solid #2ca9b7;
    background: #0b284c;
    color: #ffffff;
    border-radius: 8px;
  }
  .react-datepicker__input-container {
    position: relative;

    &:after {
      content: '';
      position: absolute;
      height: 0;
      width: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #2ca9b7;
      display: block;
      right: 0;
      top: 50%;
      margin-top: -3px;
    }

    input {
      caret-color: transparent;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 3px;
      border: 0;
      appearance: none;
      background-color: transparent;
      color: #2fccdc;
      text-align: right;
      padding-right: 15px;

      &:focus {
        outline: none;
        border: 0;
      }
    }
  }

  .datepicker-popper-wrap {
    letter-spacing: initial;
    text-transform: none;
    .react-datepicker__triangle {
      transform: translate3d(220px, 0, 0) !important;
      &:after,
      &:before {
        border-bottom-color: #2ca9b7 !important;
        border-top-color: #2ca9b7 !important;
      }
    }

    .react-datepicker__day {
      border: 2px solid transparent;
      color: #ffffff;

      &:hover {
        background: transparent;
        border: 2px solid #2ca9b7;
      }
    }

    .react-datepicker__day--keyboard-selected {
      background: transparent;
      border: 2px solid #2ca9b7;
    }

    .react-datepicker__header {
      background: #2ca9b7;
      border-bottom: #2ca9b7;
    }

    .react-datepicker__navigation {
      padding-top: 10px;
    }

    .react-datepicker__navigation-icon::before {
      border-color: #0b284c;
    }

    .react-datepicker__current-month,
    .react-datepicker__day-name {
      color: #0b284c;
    }

    .react-datepicker__day--outside-month {
      opacity: 0.6;
    }

    .react-datepicker__day--selected {
      background: #2ca9b7;
      opacity: 1;
    }
    .react-datepicker__day--disabled {
      opacity: 0.15;
      cursor: default;
      pointer-events: none;
    }
  }
`;

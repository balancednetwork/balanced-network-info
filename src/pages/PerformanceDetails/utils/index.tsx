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
  week: {
    displayText: 'week',
    days: 7,
  },
  twoWeeks: {
    displayText: 'two weeks',
    days: 14,
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

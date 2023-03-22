import React from 'react';

import { Flex } from 'rebass';
import styled from 'styled-components';

import { Typography } from 'theme';

export type CollateralChartTimeFrame = {
  displayName: string;
  days: number;
};

export type TimeFrame = 'WEEK' | 'MONTH' | 'QUARTER_YEAR' | 'HALF_YEAR';

export const timeFrames: { [key in TimeFrame]: CollateralChartTimeFrame } = Object.freeze({
  WEEK: {
    displayName: 'week',
    days: 7,
  },
  MONTH: {
    displayName: 'month',
    days: 30,
  },
  QUARTER_YEAR: {
    displayName: '3 months',
    days: 91,
  },
  HALF_YEAR: {
    displayName: '6 months',
    days: 182,
  },
});

const TimeFramesWrap = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 14px;
`;

const TimeFrameButton = styled.button<{ isActive: boolean }>`
  padding: 1px 12px 2px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-right: 5px;
  border-radius: 8px;
  border: 0;
  background: ${({ isActive, theme }) => (isActive ? theme.colors.primary : theme.colors.bg3)};
  cursor: ${({ isActive }) => (isActive ? 'default' : 'pointer')};
  pointer-events: ${({ isActive }) => (isActive ? 'none' : 'all')};
  transition: all ease 0.3s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export default function TimeFrameSelector({
  selected,
  setSelected,
}: {
  selected: CollateralChartTimeFrame;
  setSelected: (CollateralChartTimeFrame) => void;
}) {
  return (
    <TimeFramesWrap>
      {/* <Typography fontSize={16} mr={1} width="auto">
        Over the past{' '}
      </Typography> */}
      {Object.values(timeFrames).map(item => (
        <TimeFrameButton isActive={item.days === selected.days} key={item.days} onClick={() => setSelected(item)}>
          {item.displayName}
        </TimeFrameButton>
      ))}
    </TimeFramesWrap>
  );
}

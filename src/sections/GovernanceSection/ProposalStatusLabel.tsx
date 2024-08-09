import React from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { Flex } from 'rebass/styled-components';

import CalendarIcon from '@/assets/icons/calendar-small.svg';
import FailureIcon from '@/assets/icons/failure.svg';
import TickIcon from '@/assets/icons/tick.svg';
import { Typography } from '@/theme';

import { formatTimeStr } from './utils';

dayjs.extend(utc);
dayjs.extend(relativeTime);

const StatusMap = {
  Pending: `Pending`,
  Active: `Active`,
  Cancelled: `Cancelled`,
  Defeated: `Rejected`,
  Succeeded: `Approved`,
  'No Quorum': `Quorum not reached`,
  Executed: `Enacted`,
  'Failed Execution': `Failed to enact`,
};

interface ProposalStatusProps {
  status: string;
  startDay: number;
  endDay: number;
}

export function ProposalStatusIcon(props: ProposalStatusProps) {
  const { status, startDay, endDay } = props;
  const startTimeStr = startDay ? formatTimeStr(startDay) : '';
  const endTimeStr = endDay ? formatTimeStr(endDay) : '';

  if (status === 'Defeated' || status === 'No Quorum' || status === 'Failed Execution' || status === 'Cancelled') {
    return (
      <Flex alignItems="center" sx={{ columnGap: '10px' }}>
        <FailureIcon height="22" width="22" />
        <Typography color="white">{StatusMap[status]}</Typography>
      </Flex>
    );
  }

  if ((status === 'Pending' || status === 'Confirmed') && !!startTimeStr) {
    return (
      <Flex alignItems="center" sx={{ columnGap: '10px' }}>
        <CalendarIcon height="22" width="22" />
        <Typography color="white">{`Voting starts in ${startTimeStr}`}</Typography>
      </Flex>
    );
  }

  if (status === 'Active') {
    if (!startTimeStr && !!endTimeStr) {
      return (
        <Flex alignItems="center" sx={{ columnGap: '10px' }}>
          <CalendarIcon height="22" width="22" />
          <Typography color="white">{`Voting ends in ${endTimeStr}`}</Typography>
        </Flex>
      );
    } else if (!!startTimeStr) {
      return (
        <Flex alignItems="center" sx={{ columnGap: '10px' }}>
          <CalendarIcon height="22" width="22" />
          <Typography color="white">{`Voting starts in ${startTimeStr}`}</Typography>
        </Flex>
      );
    }
  }

  if (status === 'Succeeded' || status === 'Executed') {
    return (
      <Flex alignItems="center" sx={{ columnGap: '10px' }}>
        <TickIcon height="22" width="22" />
        <Typography color="white">{StatusMap[status]}</Typography>
      </Flex>
    );
  }

  //this state might occur shortly after voting ends before smart contract updates vote status
  if (!endTimeStr && !startTimeStr) {
    return (
      <Flex alignItems="center" sx={{ columnGap: '10px' }}>
        <TickIcon height="22" width="22" />
        <Typography color="white">Voting has ended</Typography>
      </Flex>
    );
  }

  return (
    <Flex alignItems="center">
      <Typography color="white">{StatusMap[status]}</Typography>
    </Flex>
  );
}

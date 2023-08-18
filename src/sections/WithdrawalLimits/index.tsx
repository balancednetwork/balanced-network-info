import { BoxPanel } from 'components/Panel';
import { useWithdrawalsFloorData } from 'queries';
import React from 'react';
import { Typography } from 'theme';

const WithdrawalLimits = () => {
  const { data: withdrawalsFloorData } = useWithdrawalsFloorData();

  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb={5} mr={2}>
        Withdrawal Limits
      </Typography>
    </BoxPanel>
  );
};

export default WithdrawalLimits;

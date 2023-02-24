import React from 'react';

import dayjs from 'dayjs';
import { useLoanInfo } from 'queries';
import { Flex } from 'rebass';

import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

import { ChartPanel } from '..';
import Chart from './Chart';

export default function BnUSDChart({ selectedCollateral }: { selectedCollateral: string }) {
  const loanInfo = useLoanInfo();

  const [userHovering, setUserHovering] = React.useState<boolean>(false);

  const [bnUSDHover, setBnUSDHover] = React.useState<number | undefined>();
  const [bnUSDLabel, setBnUSDLabel] = React.useState<string | undefined>();

  const [totalBnUSD, setTotalBnUSD] = React.useState<undefined | number>();

  React.useEffect(() => {
    if (!userHovering) {
      setBnUSDHover(totalBnUSD);
    }
  }, [bnUSDHover, totalBnUSD, userHovering]);

  return (
    <ChartPanel bg="bg2">
      <Flex flexDirection={['column', 'row']}>
        <Flex mr="auto" flexDirection="column" mb={1}>
          <Typography variant="h2" mr="auto" mb={1}>
            Balanced Dollars
          </Typography>
          <Typography variant="p" color="text2" mr="auto" fontSize={18}>
            {bnUSDLabel ? <>{bnUSDLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}
          </Typography>
        </Flex>
        <Flex flexDirection="column" alignItems={['start', 'end']} mb={1}>
          <Typography variant="h3" mb={1}>
            {bnUSDHover ? getFormattedNumber(bnUSDHover || 0, 'number') : <LoaderComponent />} bnUSD
          </Typography>
        </Flex>
      </Flex>

      <Chart
        selectedCollateral={selectedCollateral}
        collateralTVLHover={bnUSDHover}
        collateralLabel={bnUSDLabel}
        setCollateralTVLHover={setBnUSDHover}
        setCollateralLabel={setBnUSDLabel}
        setTotalBnUSD={setTotalBnUSD}
        setUserHovering={setUserHovering}
      ></Chart>

      <Flex my={3} mx={-4}>
        <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
          <Typography variant="p" fontSize={[16, '18px']}>
            {loanInfo.loansAPY ? getFormattedNumber(loanInfo.loansAPY, 'percent2') : <LoaderComponent />}
          </Typography>
          <Typography opacity={0.75}>Borrow APY</Typography>
        </Flex>
        <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
          <Typography variant="p" fontSize={[16, '18px']}>
            {loanInfo.dailyRewards ? getFormattedNumber(loanInfo.dailyRewards, 'number') : <LoaderComponent />} BALN
          </Typography>
          <Typography opacity={0.75}>Daily rewards</Typography>
        </Flex>
        <Flex flex={1} flexDirection="column" alignItems="center">
          <Typography variant="p" fontSize={[16, '18px']}>
            {loanInfo.borrowers ? getFormattedNumber(loanInfo.borrowers, 'number') : <LoaderComponent />}
          </Typography>
          <Typography opacity={0.75}>Borrowers</Typography>
        </Flex>
      </Flex>
    </ChartPanel>
  );
}

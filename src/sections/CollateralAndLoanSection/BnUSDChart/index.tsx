import React from 'react';

import { addresses } from '@balancednetwork/balanced-js';
import dayjs from 'dayjs';
import { useLoanInfo, useRatesQuery } from 'queries';
import { useContractMethodsDataQuery } from 'queries/backendv2';
import { useHistoryForBnUSDTotalSupply } from 'queries/historicalData';
import { Flex } from 'rebass';

import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import Spinner from 'components/Spinner';
import useTheme from 'hooks/useTheme';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

import { ChartContainer, ChartPanel } from '..';
import Chart from './Chart';
import StabilityFundChart from './StabilityFundChart';

export default function BnUSDChart({
  selectedCollateral,
  setCollateral,
}: {
  selectedCollateral: string;
  setCollateral: (string) => void;
}) {
  const loanInfo = useLoanInfo();
  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};

  const [userHovering, setUserHovering] = React.useState<boolean>(false);

  const [loanTVLHover, setLoansTVLHover] = React.useState<number | undefined>();
  const [loanLabel, setLoanLabel] = React.useState<string | undefined>();
  const [SFloanTVLHover, SFsetLoansTVLHover] = React.useState<number | undefined>();
  const [SFloanLabel, SFsetLoanLabel] = React.useState<string | undefined>();
  React.useEffect(() => {
    if (!loanTVLHover && loanInfo) {
      setLoansTVLHover(loanInfo.totalBnUSD);
    }
  }, [loanTVLHover, loanInfo]);

  return (
    <ChartPanel bg="bg2">
      <Flex flexDirection={['column', 'row']}>
        <Flex mr="auto" flexDirection="column" mb={1}>
          <Typography variant="h2" mr="auto" mb={1}>
            Balanced Dollars
          </Typography>
          <Typography variant="p" color="text2" mr="auto" fontSize={18}>
            {loanLabel ? <>{loanLabel}</> : SFloanLabel ? <>{SFloanLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}
          </Typography>
        </Flex>
        <Flex flexDirection="column" alignItems={['start', 'end']} mb={1}>
          <Typography variant="h3" mb={1}>
            {loanInfo.totalBnUSD ? getFormattedNumber(loanTVLHover || 0, 'number') : <LoaderComponent />} bnUSD
          </Typography>
          <Typography color="text2" fontSize={18}>
            {rates && rates['bnUSD'] && loanInfo.totalBnUSD ? (
              `$${rates['bnUSD'].times(loanTVLHover || 1).toFormat(0)}`
            ) : (
              <LoaderComponent />
            )}
          </Typography>
        </Flex>
      </Flex>

      {selectedCollateral === predefinedCollateralTypes.STABILITY_FUND ? (
        <StabilityFundChart
          collateralTVLHover={SFloanTVLHover}
          collateralLabel={SFloanLabel}
          setCollateralTVLHover={SFsetLoansTVLHover}
          setCollateralLabel={SFsetLoanLabel}
          setUserHovering={setUserHovering}
        ></StabilityFundChart>
      ) : (
        <Chart
          selectedCollateral={selectedCollateral}
          collateralTVLHover={loanTVLHover}
          collateralLabel={loanLabel}
          setCollateralTVLHover={setLoansTVLHover}
          setCollateralLabel={setLoanLabel}
          setUserHovering={setUserHovering}
        ></Chart>
      )}

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

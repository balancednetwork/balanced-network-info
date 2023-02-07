import React from 'react';

import { addresses } from '@balancednetwork/balanced-js';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { useContractMethodsDataQuery } from 'queries/backendv2';
import useHistoryFor from 'queries/historicalData';
import { getBitcoinCollateralParams } from 'queries/historicalData/predefinedOptions';
import { useCollateralInfo, useLoanInfo, useRatesQuery } from 'queries/index';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import { BoxPanel } from 'components/Panel';
import Spinner from 'components/Spinner';
import { ONE } from 'constants/number';
import useTheme from 'hooks/useTheme';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

const ChartSection = styled(Box)`
  box-sizing: border-box;
  margin: 0px;
  min-width: 0px;
  width: 100%;
  display: flex;
  padding: 0px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  column-gap: 50px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    row-gap: 50px;
  `}
`;

const ChartPanel = styled(BoxPanel)`
  width: 100%;
`;

const ChartContainer = styled(Box)`
  position: relative;
  height: ${DEFAULT_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function CollateralAndLoanSection() {
  const collateralInfo = useCollateralInfo();
  const loanInfo = useLoanInfo();
  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};
  const theme = useTheme();
  const { data: collateralChartData } = useContractMethodsDataQuery(addresses[1].loans, 'getTotalCollateral');
  const { data: loansChartData } = useContractMethodsDataQuery(addresses[1].bnusd, 'totalSupply');

  const [loanTVLHover, setLoansTVLHover] = React.useState<number | undefined>();
  const [loanLabel, setLoanLabel] = React.useState<string | undefined>();
  React.useEffect(() => {
    if (!loanTVLHover && loanInfo) {
      setLoansTVLHover(loanInfo.totalLoans);
    }
  }, [loanTVLHover, loanInfo]);

  const [collateralTVLHover, setCollateralTVLHover] = React.useState<number | undefined>();
  const [collateralLabel, setCollateralLabel] = React.useState<string | undefined>();
  const collateralTVLInUSDHover = getFormattedNumber(
    new BigNumber(collateralTVLHover || '0')
      .times(rates['sICX'] || ONE)
      .integerValue()
      .toNumber(),
    'currency0',
  );
  React.useEffect(() => {
    if (!collateralTVLHover && collateralInfo) {
      setCollateralTVLHover(collateralInfo.totalCollateral);
    }
  }, [collateralTVLHover, collateralInfo]);

  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: historyFor } = useHistoryFor(getBitcoinCollateralParams(now, 'week', 10));

  return (
    <ChartSection>
      {/* <ChartPanel bg="bg2">
        <Typography variant="h2" mb={1}>
          New Collateral
        </Typography>
        <ChartContainer>
          {historyFor ? (
            <LineChart
              data={historyFor}
              height={DEFAULT_HEIGHT}
              minHeight={DEFAULT_HEIGHT}
              color={theme.colors.primary}
              value={collateralTVLHover}
              label={collateralLabel}
              setValue={setCollateralTVLHover}
              setLabel={setCollateralLabel}
            />
          ) : (
            <Spinner size={75} />
          )}
        </ChartContainer>
      </ChartPanel> */}

      <ChartPanel bg="bg2">
        <Typography variant="h2" mb={1}>
          Collateral
        </Typography>
        <Typography variant="h3" mb={1}>
          {collateralInfo.totalCollateral ? getFormattedNumber(collateralTVLHover || 0, 'number') : <LoaderComponent />}{' '}
          sICX{' '}
          {collateralInfo.totalCollateral && (
            <Typography variant="p" as="span" color="text1">
              {`(${collateralTVLInUSDHover})`}
            </Typography>
          )}
        </Typography>
        <Typography variant="p">
          {collateralLabel ? <>{collateralLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}
        </Typography>
        <ChartContainer>
          {collateralChartData ? (
            <LineChart
              data={collateralChartData}
              height={DEFAULT_HEIGHT}
              minHeight={DEFAULT_HEIGHT}
              color={theme.colors.primary}
              value={collateralTVLHover}
              label={collateralLabel}
              setValue={setCollateralTVLHover}
              setLabel={setCollateralLabel}
            />
          ) : (
            <Spinner size={75} />
          )}
        </ChartContainer>
        <Flex my={3}>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize="18px">
              {collateralInfo.stakingAPY ? (
                getFormattedNumber(collateralInfo.stakingAPY, 'percent2')
              ) : (
                <LoaderComponent />
              )}
            </Typography>
            <Typography>Staking APY</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center">
            <Typography variant="p" fontSize="18px">
              {collateralInfo.rate ? getFormattedNumber(collateralInfo.rate, 'number4') : <LoaderComponent />}
            </Typography>
            <Typography>sICX / ICX price</Typography>
          </Flex>
        </Flex>
      </ChartPanel>

      <ChartPanel bg="bg2">
        <Typography variant="h2" mb={1}>
          Loans
        </Typography>
        <Typography variant="h3" mb={1}>
          {loanInfo.totalLoans ? getFormattedNumber(loanTVLHover || 0, 'number') : <LoaderComponent />} bnUSD
        </Typography>
        <Typography variant="p">{loanLabel ? <>{loanLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}</Typography>
        <ChartContainer>
          {loansChartData ? (
            <LineChart
              data={loansChartData}
              height={DEFAULT_HEIGHT}
              minHeight={DEFAULT_HEIGHT}
              color={theme.colors.primary}
              value={loanTVLHover}
              label={loanLabel}
              setValue={setLoansTVLHover}
              setLabel={setLoanLabel}
            />
          ) : (
            <Spinner size={75} />
          )}
        </ChartContainer>
        <Flex my={3} mx={-4}>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.loansAPY ? getFormattedNumber(loanInfo.loansAPY, 'percent2') : <LoaderComponent />}
            </Typography>
            <Typography>Borrow APY</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.dailyRewards ? getFormattedNumber(loanInfo.dailyRewards, 'number') : <LoaderComponent />} BALN
            </Typography>
            <Typography>Daily rewards</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.borrowers ? getFormattedNumber(loanInfo.borrowers, 'number') : <LoaderComponent />}
            </Typography>
            <Typography>Borrowers</Typography>
          </Flex>
        </Flex>
      </ChartPanel>
    </ChartSection>
  );
}

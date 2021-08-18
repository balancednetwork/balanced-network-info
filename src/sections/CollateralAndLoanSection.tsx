import React from 'react';

import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import {
  useCollateralChartDataQuery,
  useCollateralInfo,
  useLoanChartDataQuery,
  useLoanInfo,
  useRatesQuery,
} from 'queries/index';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import { BoxPanel } from 'components/Panel';
import { ONE } from 'constants/number';
import useTheme from 'hooks/useTheme';
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
`;

export default function CollateralAndLoanSection() {
  const collateralInfo = useCollateralInfo();
  const collateralChartDataQuery = useCollateralChartDataQuery();
  const loanInfo = useLoanInfo();
  const loanChartDataQuery = useLoanChartDataQuery();
  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};
  const theme = useTheme();

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

  return (
    <ChartSection>
      <ChartPanel bg="bg2">
        <Typography variant="h2" mb={1}>
          Collateral
        </Typography>
        <Typography variant="h3" mb={1}>
          {collateralInfo.totalCollateral ? getFormattedNumber(collateralTVLHover || 0, 'number') : '-'} sICX{' '}
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
          {collateralChartDataQuery.data && (
            <LineChart
              data={collateralChartDataQuery.data}
              height={DEFAULT_HEIGHT}
              minHeight={DEFAULT_HEIGHT}
              color={theme.colors.primary}
              value={collateralTVLHover}
              label={collateralLabel}
              setValue={setCollateralTVLHover}
              setLabel={setCollateralLabel}
            />
          )}
        </ChartContainer>
        <Flex my={3}>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize="18px">
              {collateralInfo.stakingAPY ? getFormattedNumber(collateralInfo.stakingAPY, 'percent2') : '-'}
            </Typography>
            <Typography>Staking APY</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center">
            <Typography variant="p" fontSize="18px">
              {collateralInfo.rate ? getFormattedNumber(collateralInfo.rate, 'number4') : '-'}
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
          {loanInfo.totalLoans ? getFormattedNumber(loanTVLHover || 0, 'number') : '-'} bnUSD
        </Typography>
        <Typography variant="p">{loanLabel ? <>{loanLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}</Typography>
        <ChartContainer>
          {loanChartDataQuery.data && (
            <LineChart
              data={loanChartDataQuery.data}
              height={DEFAULT_HEIGHT}
              minHeight={DEFAULT_HEIGHT}
              color={theme.colors.primary}
              value={loanTVLHover}
              label={loanLabel}
              setValue={setLoansTVLHover}
              setLabel={setLoanLabel}
            />
          )}
        </ChartContainer>
        <Flex my={3}>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.loansAPY ? getFormattedNumber(loanInfo.loansAPY, 'percent2') : '-'}
            </Typography>
            <Typography>Borrow APY</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.dailyRewards ? getFormattedNumber(loanInfo.dailyRewards, 'number') : '-'} BALN
            </Typography>
            <Typography>Daily rewards</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.borrowers ? getFormattedNumber(loanInfo.borrowers, 'number') : '-'}
            </Typography>
            <Typography>Borrowers</Typography>
          </Flex>
        </Flex>
      </ChartPanel>
    </ChartSection>
  );
}

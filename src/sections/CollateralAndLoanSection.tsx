import React from 'react';

import { addresses } from '@balancednetwork/balanced-js';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { useHistoricalDataQuery } from 'queries/historical';
import { useCollateralInfo, useLoanInfo, useRatesQuery } from 'queries/index';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import CollateralSelector from 'components/CollateralSelector';
import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import { BoxPanel } from 'components/Panel';
import Spinner from 'components/Spinner';
import { ONE } from 'constants/number';
import useTheme from 'hooks/useTheme';
import useWidth from 'hooks/useWidth';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { useTokensCollateralData } from 'store/collateral/hooks';
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
  const { data: collateralChartData } = useHistoricalDataQuery(addresses[1].loans, 'getTotalCollateral');
  const { data: loansChartData } = useHistoricalDataQuery(addresses[1].bnusd, 'totalSupply');

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

  const [ref, width] = useWidth();

  const supportedTokens = useTokensCollateralData();

  return (
    <ChartSection>
      <ChartPanel bg="bg2">
        <Flex ref={ref} alignItems="center" mb={1}>
          <Typography variant="h2" mr={2}>
            Collateral:
          </Typography>
          <CollateralSelector width={width} containerRef={ref.current} />
        </Flex>

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
        <Flex flexDirection={['column', 'row']}>
          <Flex mr="auto" flexDirection="column" mb={1}>
            <Typography variant="h2" mr="auto" mb={1}>
              Balanced Dollars
            </Typography>
            <Typography variant="p" color="text2" mr="auto" fontSize={18}>
              {loanLabel ? <>{loanLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}
            </Typography>
          </Flex>
          <Flex flexDirection="column" alignItems={['start', 'end']} mb={1}>
            <Typography variant="h3" mb={1}>
              {loanInfo.totalLoans ? getFormattedNumber(loanTVLHover || 0, 'number') : <LoaderComponent />} bnUSD
            </Typography>
            <Typography color="text2" fontSize={18}>
              {rates && rates['bnUSD'] && loanInfo.totalLoans ? (
                `$${rates['bnUSD'].times(loanTVLHover || 1).toFormat(0)}`
              ) : (
                <LoaderComponent />
              )}
            </Typography>
          </Flex>
        </Flex>
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

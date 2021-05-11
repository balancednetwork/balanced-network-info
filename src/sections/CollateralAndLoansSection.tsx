import React from 'react';

import { useCollateralInfo, useLoansInfo } from 'queries/index';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { volumeData } from 'assets/demo';
import { BoxPanel } from 'components/Panel';
import TradingViewChart, { CHART_TYPES, HEIGHT } from 'components/TradingViewChart';
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

  @media (max-width: 720px) {
    flex-direction: column;
    row-gap: 50px;
  }
`;

const ChartPanel = styled(BoxPanel)`
  width: 48%;

  @media (max-width: 720px) {
    width: 100%;
  }
`;

const ChartContainer = styled(Box)`
  position: relative;
  height: ${HEIGHT}px;
`;

export default function CollateralAndLoansSection() {
  // update the width on a window resize
  const ref = React.useRef<HTMLDivElement>();
  const [width, setWidth] = React.useState(ref?.current?.clientWidth);
  React.useEffect(() => {
    function handleResize() {
      setWidth(ref?.current?.clientWidth ?? width);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  const collateralInfo = useCollateralInfo();
  const loansInfo = useLoansInfo();

  return (
    <ChartSection>
      <ChartPanel bg="bg2">
        <Typography variant="h2" mb={1}>
          Collateral
        </Typography>
        <Typography variant="h3" mb={1}>
          {collateralInfo.totalCollateral ? getFormattedNumber(collateralInfo.totalCollateral, 'number') : '-'} sICX{' '}
          <Typography variant="p" as="span" color="text1">
            ($
            {collateralInfo.totalCollateralTVL ? getFormattedNumber(collateralInfo.totalCollateralTVL, 'number') : '-'})
          </Typography>
        </Typography>
        <ChartContainer ref={ref}>
          <TradingViewChart data={volumeData} width={width} type={CHART_TYPES.AREA} />
        </ChartContainer>
        <Flex my={3}>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize="18px">
              11.38%
            </Typography>
            <Typography>Staking APY</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize="18px">
              {collateralInfo.rate ? getFormattedNumber(collateralInfo.rate, 'number4') : '-'}
            </Typography>
            <Typography>sICX / ICX price</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center">
            <Typography variant="p" fontSize="18px">
              {'-'}
            </Typography>
            <Typography>Depositors</Typography>
          </Flex>
        </Flex>
      </ChartPanel>

      <ChartPanel bg="bg2">
        <Typography variant="h2" mb={1}>
          Loans
        </Typography>
        <Typography variant="h3" mb={1}>
          {loansInfo.totalLoans ? getFormattedNumber(loansInfo.totalLoans, 'number') : '-'} bnUSD
        </Typography>
        <TradingViewChart data={volumeData} width={width} type={CHART_TYPES.AREA} />
        <Flex my={3}>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize="18px">
              {loansInfo.loansAPY ? getFormattedNumber(loansInfo.loansAPY, 'percent0') : '-'}
            </Typography>
            <Typography>Borrow APY</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize="18px">
              {loansInfo.dailyRewards ? getFormattedNumber(loansInfo.dailyRewards, 'number') : '-'} BALN
            </Typography>
            <Typography>Daily rewards</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center">
            <Typography variant="p" fontSize="18px">
              {'-'}
            </Typography>
            <Typography>Borrowers</Typography>
          </Flex>
        </Flex>
      </ChartPanel>
    </ChartSection>
  );
}

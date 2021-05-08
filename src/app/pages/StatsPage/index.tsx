import React from 'react';

import { Helmet } from 'react-helmet-async';
import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import { Button } from 'app/components/Button';
import Divider from 'app/components/Divider';
import Logo from 'app/components/Logo';
import { BoxPanel } from 'app/components/Panel';
import TradingViewChart, { CHART_TYPES, HEIGHT } from 'app/components/TradingViewChart';
import { Typography } from 'app/theme';
import { volumeData } from 'assets/demo';
import { ReactComponent as FeesIcon } from 'assets/icons/fees.svg';
import { ReactComponent as TransactionsIcon } from 'assets/icons/transactions.svg';
import { ReactComponent as UsersIcon } from 'assets/icons/users.svg';
import { ReactComponent as VaultIcon } from 'assets/icons/vault.svg';
import pool3Src from 'assets/images/pools/pool-baln-bnusd.png';
// import pool2Src from 'assets/images/pools/pool-sicx-bnusd.png';
// import pool1Src from 'assets/images/pools/pool-sicx-icx.png';

const Container = styled(Box)`
  /* disable margin collapse */
  display: flex;
  flex-direction: column;
  max-width: 1280px;
  min-height: 100vh;
  margin-left: auto;
  margin-right: auto;
  padding-left: 40px;
  padding-right: 40px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding-left: 16px;
    padding-right: 16px;
  `}
`;

const StyledHeader = styled(Box)`
  margin-top: 50px;
  margin-bottom: 50px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 25px;
    margin-bottom: 25px;
  `}
`;

const StatsLayout = styled(Box)`
  display: grid;
  grid-auto-rows: auto;
  row-gap: 50px;
`;

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

const Overview = styled(Flex)`
  display: flex;
`;

const OverviewItem = styled(Flex)`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;

  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: center;
  }
`;

const OverviewItemIcon = styled(Box)`
  margin: 8px 8px;
`;

const OverviewItemData = styled(Box)`
  margin: 8px 8px;
`;

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`;

const ChartContainer = styled(Box)`
  position: relative;
  height: ${HEIGHT}px;
`;

const DashGrid = styled(Box)`
  display: grid;
  gap: 1em;
  align-items: center;
  grid-template-columns: 2fr repeat(5, 1fr);

  > * {
    justify-content: flex-end;
    &:first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }
`;

const DataText = styled(Flex)`
  display: flex;
  font-size: 16px;
  color: #ffffff;
  align-items: center;
  line-height: 1.4;
`;

const PoolImage = styled.img`
  width: 64px;
`;

const HeaderText = styled(Flex)`
  display: flex;
  font-size: 14px;
  color: #d5d7db;
  letter-spacing: 3px;
  text-transform: uppercase;
  align-items: center;
`;

export function StatsPage() {
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

  return (
    <Container>
      <Helmet>
        <title>Stats</title>
      </Helmet>

      <StyledHeader>
        <Flex alignItems="center" justifyContent="space-between">
          <Logo />

          <Button as="a" href="/">
            Go to app
          </Button>
        </Flex>
      </StyledHeader>

      <StatsLayout>
        <BoxPanel bg="bg2">
          <Typography variant="h2" mb={5}>
            Overview
          </Typography>

          <Overview>
            {/* TVL */}
            <OverviewItem className="border-right">
              <OverviewItemIcon>
                <VaultIcon width={53} height={55} />
              </OverviewItemIcon>

              <OverviewItemData>
                <Typography variant="h3" textAlign="center">
                  $23,682,617
                </Typography>
                <Typography textAlign="center">Total value locked</Typography>
              </OverviewItemData>
            </OverviewItem>
            {/* number of Borrowers */}
            <OverviewItem className="border-right">
              <OverviewItemIcon>
                <UsersIcon width={53} height={55} />
              </OverviewItemIcon>
              <OverviewItemData>
                <Typography variant="h3" textAlign="center">
                  18,517
                </Typography>
                <Typography textAlign="center">Borrowers</Typography>
              </OverviewItemData>
            </OverviewItem>
            {/* fees */}
            <OverviewItem className="border-right">
              <OverviewItemIcon>
                <FeesIcon width={53} height={55} />
              </OverviewItemIcon>

              <OverviewItemData>
                <Typography variant="h3" textAlign="center">
                  $342,348
                </Typography>
                <Typography textAlign="center">Fees earned</Typography>
              </OverviewItemData>
            </OverviewItem>
            {/* number of transactions */}
            <OverviewItem>
              <OverviewItemIcon>
                <TransactionsIcon width={53} height={55} />
              </OverviewItemIcon>

              <OverviewItemData>
                <Typography variant="h3" textAlign="center">
                  412,152
                </Typography>
                <Typography textAlign="center">Transactions</Typography>
              </OverviewItemData>
            </OverviewItem>
          </Overview>
        </BoxPanel>

        <ChartSection>
          <ChartPanel bg="bg2">
            <Typography variant="h2" mb={1}>
              Collateral
            </Typography>
            <ChartContainer ref={ref}>
              <TradingViewChart data={volumeData} width={width} type={CHART_TYPES.AREA} />
            </ChartContainer>
          </ChartPanel>

          <ChartPanel bg="bg2">
            <Typography variant="h2" mb={1}>
              Loans
            </Typography>
            <TradingViewChart data={volumeData} width={width} type={CHART_TYPES.AREA} />
          </ChartPanel>
        </ChartSection>

        <BoxPanel bg="bg2">
          <Typography variant="h2" mb={5}>
            Exchange
          </Typography>

          <List>
            <DashGrid>
              <HeaderText>POOL</HeaderText>
              <HeaderText>APY</HeaderText>
              <HeaderText>PARTICIPANTS</HeaderText>
              <HeaderText>LIQUIDITY</HeaderText>
              <HeaderText>VOLUME (24H)</HeaderText>
              <HeaderText>FEES (24H)</HeaderText>
            </DashGrid>

            <DashGrid my={2}>
              <DataText>
                <Flex alignItems="center">
                  <PoolImage src={pool3Src} />
                  <Text ml={2}>sICX/bnUSD</Text>
                </Flex>
              </DataText>
              <DataText>285%</DataText>
              <DataText>846</DataText>
              <DataText>$1,712,318</DataText>
              <DataText>$1,712,318</DataText>
              <DataText>$1,712,318</DataText>
            </DashGrid>

            <Divider />

            <DashGrid my={2}>
              <DataText>
                <Flex alignItems="center">
                  <PoolImage src={pool3Src} />
                  <Text ml={2}>sICX/bnUSD</Text>
                </Flex>
              </DataText>
              <DataText>285%</DataText>
              <DataText>846</DataText>
              <DataText>$1,712,318</DataText>
              <DataText>$1,712,318</DataText>
              <DataText>$1,712,318</DataText>
            </DashGrid>

            <Divider />

            <DashGrid my={2}>
              <DataText>
                <Flex alignItems="center">
                  <PoolImage src={pool3Src} />
                  <Text ml={2}>sICX/bnUSD</Text>
                </Flex>
              </DataText>
              <DataText>285%</DataText>
              <DataText>846</DataText>
              <DataText>$1,712,318</DataText>
              <DataText>$1,712,318</DataText>
              <DataText>$1,712,318</DataText>
            </DashGrid>
          </List>
        </BoxPanel>
      </StatsLayout>
    </Container>
  );
}

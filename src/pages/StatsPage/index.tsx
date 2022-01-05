import React from 'react';

import { useGovernanceInfo, useOverviewInfo } from 'queries/index';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import arrowIcon from 'assets/icons/arrow.svg';
import { ReactComponent as CalendarIcon } from 'assets/icons/calendar.svg';
import { ReactComponent as ChartIcon } from 'assets/icons/chart.svg';
import { ReactComponent as CoinsIcon } from 'assets/icons/coins.svg';
import { ReactComponent as DaoIcon } from 'assets/icons/dao.svg';
import { ReactComponent as DistributionIcon } from 'assets/icons/distribution.svg';
import { ReactComponent as FeesIcon } from 'assets/icons/fees.svg';
import { ReactComponent as StakersIcon } from 'assets/icons/staking2.svg';
import vault from 'assets/icons/vault.svg';
import Footer from 'components/Footer';
import Header from 'components/Header';
import { BoxPanel } from 'components/Panel';
import { LINKS } from 'constants/links';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import CollateralAndLoanSection from 'sections/CollateralAndLoanSection';
import PairSection from 'sections/PairSection';
import TokenSection from 'sections/TokenSection';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

export const Container = styled(Box)`
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
    padding-left: 5%;
    padding-right: 5%;
  `}
`;

const StatsLayout = styled(Box)`
  display: grid;
  grid-auto-rows: auto;
  row-gap: 50px;
`;

const Stats = styled(Flex)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: none;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  `}
`;

const StatsItem = styled(Flex)`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    border-right: 0;
  `}

  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: center;
  }
`;

const StatsItemIcon = styled(Box)`
  margin: 8px 8px;
`;

const StatsItemData = styled(Box)`
  margin: 8px 8px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    text-align: center;
  `}
`;

export const Divider = styled(Box)`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-bottom: 20px;
  margin-top: 80px;
`;

const StyledArrowLink = styled(Link)`
  color: #2fccdc;
  text-decoration: none;
  line-height: 40px;
  position: relative;
  padding: 0 30px 0 3px;

  &:after {
    content: '';
    display: block;
    position: absolute;
    background-image: url(${arrowIcon});
    height: 10px;
    width: 20px;
    background-repeat: no-repeat;
    top: 16px;
    right: 0;
    transform: translate3d(5px, 0, 0);
    transition: transform 0.3s ease;
  }

  &:hover {
    &:after {
      transform: translate3d(15px, 0, 0);
    }
  }
`;

export function StatsPage() {
  const overviewInfo = useOverviewInfo();
  const governanceInfo = useGovernanceInfo();

  return (
    <Container>
      <Helmet>
        <title>Statistics | Balanced</title>
      </Helmet>

      <Header />

      <StatsLayout>
        <Typography fontWeight="bold" fontSize={[45, 45, 60]} color="#fff">
          Statistics
        </Typography>
        <BoxPanel bg="bg2">
          <Stats>
            {/* TVL */}
            <StatsItem className="border-right">
              <StatsItemIcon>
                {/* svg has issue with linear gradient, so use img here for this icon */}
                <img src={vault} alt="value" width={53} height={55} />
              </StatsItemIcon>
              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {overviewInfo.TVL ? getFormattedNumber(overviewInfo.TVL, 'currency0') : <LoaderComponent />}
                </Typography>
                <Typography>Total value locked</Typography>
              </StatsItemData>
            </StatsItem>
            {/* number of Borrowers */}
            <StatsItem className="border-right">
              <StatsItemIcon>
                <CoinsIcon width={53} height={55} />
              </StatsItemIcon>
              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {overviewInfo.BALNMarketCap ? (
                    getFormattedNumber(overviewInfo.BALNMarketCap, 'currency0')
                  ) : (
                    <LoaderComponent />
                  )}
                </Typography>
                <Typography>BALN marketcap</Typography>
              </StatsItemData>
            </StatsItem>
            {/* fees */}
            <StatsItem className="border-right">
              <StatsItemIcon>
                <FeesIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {overviewInfo.fees ? getFormattedNumber(overviewInfo.fees, 'currency0') : <LoaderComponent />}
                </Typography>
                <Typography>Fees earned</Typography>
              </StatsItemData>
            </StatsItem>
            {/* number of transactions */}
            <StatsItem>
              <StatsItemIcon>
                <CalendarIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {overviewInfo.platformDay ? (
                    getFormattedNumber(overviewInfo.platformDay, 'number')
                  ) : (
                    <LoaderComponent />
                  )}
                </Typography>
                <Typography>Days since launch</Typography>
              </StatsItemData>
            </StatsItem>
          </Stats>
        </BoxPanel>

        <CollateralAndLoanSection />

        <TokenSection />

        <PairSection />

        <BoxPanel bg="bg2" mb={10}>
          <Flex flexWrap="wrap" mb={5}>
            <Typography variant="h2" mr={3}>
              Governance
            </Typography>
            <StyledArrowLink to={LINKS.performanceDetails}>Performance details</StyledArrowLink>
          </Flex>

          <Stats>
            <StatsItem className="border-right">
              <StatsItemIcon>
                <DaoIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {governanceInfo.daofund ? (
                    getFormattedNumber(governanceInfo.daofund, 'currency0')
                  ) : (
                    <LoaderComponent />
                  )}
                </Typography>
                <Typography>DAO fund</Typography>
              </StatsItemData>
            </StatsItem>

            <StatsItem className="border-right">
              <StatsItemIcon>
                <StakersIcon width={53} height={55} />
              </StatsItemIcon>
              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {governanceInfo.numOfStakers ? (
                    getFormattedNumber(governanceInfo.numOfStakers, 'number')
                  ) : (
                    <LoaderComponent />
                  )}
                </Typography>
                <Typography>BALN stakers</Typography>
              </StatsItemData>
            </StatsItem>

            <StatsItem className="border-right">
              <StatsItemIcon>
                <ChartIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {governanceInfo.totalStakedBALN ? (
                    getFormattedNumber(governanceInfo.totalStakedBALN, 'number')
                  ) : (
                    <LoaderComponent />
                  )}{' '}
                </Typography>
                <Typography>BALN staked</Typography>
              </StatsItemData>
            </StatsItem>

            <StatsItem>
              <StatsItemIcon>
                <DistributionIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {governanceInfo.dailyDistribution ? (
                    getFormattedNumber(governanceInfo.dailyDistribution, 'number')
                  ) : (
                    <LoaderComponent />
                  )}{' '}
                  <Typography as="span" fontWeight="normal" color="text1">
                    BALN
                  </Typography>
                </Typography>
                <Typography>Today's distribution</Typography>
              </StatsItemData>
            </StatsItem>
          </Stats>
        </BoxPanel>
      </StatsLayout>

      <Divider />
      <Footer />
    </Container>
  );
}

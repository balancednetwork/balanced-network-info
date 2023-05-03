import React from 'react';

import { useOverviewInfo } from 'queries/index';
import { Helmet } from 'react-helmet-async';
import { Flex, Box } from 'rebass/styled-components';
import styled, { css } from 'styled-components';

import { ReactComponent as BalnStakingIcon } from 'assets/icons/balnstaking.svg';
import { ReactComponent as CoinsIcon } from 'assets/icons/coins.svg';
import { ReactComponent as FeesIcon } from 'assets/icons/fees.svg';
import { ReactComponent as QuestionIcon } from 'assets/icons/question.svg';
import vault from 'assets/icons/vault.svg';
import Footer from 'components/Footer';
import Header from 'components/Header';
import { BoxPanel } from 'components/Panel';
import { MouseoverTooltip } from 'components/Tooltip';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import BALNSection from 'sections/BALNSection';
import CollateralAndLoanSection from 'sections/CollateralAndLoanSection';
import GovernanceSection from 'sections/GovernanceSection';
import HoldingsOverviewSection from 'sections/HoldingsOverviewSection';
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

export const Stats = styled(Flex)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: none;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  `}

  ${({ theme }) => theme.mediaWidth.upToSuperExtraSmall`
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  `}
`;

export const StatsItem = styled(Flex)<{ border?: boolean }>`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;

  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: center;
  }

  ${({ border, theme }) =>
    border &&
    css`
      &:before {
        content: '';
        position: absolute;
        background-color: ${({ theme }) => theme.colors.divider};
        top: 13px;
        right: 0;
        height: calc(100% - 26px);
        width: 1px;

        ${({ theme }) => theme.mediaWidth.upToSmall`
        content: none;
        `}
      }
    `};
`;

export const StatsItemIcon = styled(Box)`
  margin: 8px 8px;
`;

export const StatsItemData = styled(Box)`
  margin: 8px 8px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
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

export function StatsPage() {
  const overviewInfo = useOverviewInfo();

  return (
    <Container>
      <Helmet>
        <title>Statistics | Balanced</title>
      </Helmet>

      <Header />

      <StatsLayout>
        <Flex alignItems="flex-end">
          <Typography fontWeight="bold" fontSize={[45, 45, 60]} color="#fff">
            Statistics
          </Typography>
          <Typography padding={'0 0 13px 20px'} fontSize={18} color="#FFF" opacity={0.75}>
            Day {overviewInfo.platformDay ? getFormattedNumber(overviewInfo.platformDay, 'number') : '-'}
          </Typography>
        </Flex>

        <BoxPanel bg="bg2">
          <Stats>
            {/* TVL */}
            <StatsItem border>
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
            <StatsItem border>
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
            <StatsItem border>
              <StatsItemIcon>
                <FeesIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography fontWeight="normal" variant="h3">
                  {overviewInfo.earned ? getFormattedNumber(overviewInfo.earned, 'currency0') : <LoaderComponent />}
                </Typography>
                <Typography>Earned past month</Typography>
              </StatsItemData>
            </StatsItem>
            {/* Baln staking info */}
            <StatsItem>
              <StatsItemIcon>
                <BalnStakingIcon width={55} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Flex alignItems="center" justifyContent={['center', 'center', 'start']}>
                  <Typography fontWeight="normal" variant="h3" marginRight={'7px'}>
                    {overviewInfo.bBALNAPY ? (
                      getFormattedNumber(overviewInfo.bBALNAPY.toNumber(), 'percent2')
                    ) : (
                      <LoaderComponent />
                    )}
                  </Typography>
                  {overviewInfo.monthlyFeesTotal ? (
                    <MouseoverTooltip
                      width={300}
                      text={
                        <>
                          <Typography>
                            Calculated from the network fees distributed to bBALN holders over the last 30 days (
                            <strong>${overviewInfo.monthlyFeesTotal.toFormat(0)}</strong>). Assumes the price of 1 bBALN
                            is equivalent to 1 BALN locked for 4 years
                            {overviewInfo.balnPrice ? (
                              <strong>{` ($${overviewInfo.balnPrice.toFormat(2)})`}</strong>
                            ) : (
                              ''
                            )}
                            .
                          </Typography>
                          {overviewInfo.previousChunk && (
                            <Typography mt={2}>
                              Over the past month, {overviewInfo.previousChunkAmount} bBALN would have received{' '}
                              <strong>${overviewInfo.previousChunk.toPrecision(3)}</strong>.
                            </Typography>
                          )}
                        </>
                      }
                      placement="top"
                    >
                      <QuestionIcon width={14} />
                    </MouseoverTooltip>
                  ) : null}
                </Flex>
                <Typography>bBALN APY</Typography>
              </StatsItemData>
            </StatsItem>
          </Stats>
        </BoxPanel>

        <CollateralAndLoanSection />

        <TokenSection />

        <PairSection />

        <GovernanceSection />

        <BALNSection />

        <HoldingsOverviewSection />
      </StatsLayout>

      <Divider />
      <Footer />
    </Container>
  );
}

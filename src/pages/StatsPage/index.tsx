import React from 'react';

import { useGovernanceInfo, useOverviewInfo } from 'queries/index';
import { Helmet } from 'react-helmet-async';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as ChartIcon } from 'assets/icons/chart.svg';
import { ReactComponent as CoinsIcon } from 'assets/icons/coins.svg';
import { ReactComponent as DaoIcon } from 'assets/icons/dao.svg';
import { ReactComponent as DistributionIcon } from 'assets/icons/distribution.svg';
import { ReactComponent as FeesIcon } from 'assets/icons/fees.svg';
import { ReactComponent as StakersIcon } from 'assets/icons/staking2.svg';
import { ReactComponent as TransactionsIcon } from 'assets/icons/transactions.svg';
import { ReactComponent as VaultIcon } from 'assets/icons/vault.svg';
import { Button } from 'components/Button';
import Logo from 'components/Logo';
import { BoxPanel } from 'components/Panel';
import CollateralAndLoanSection from 'sections/CollateralAndLoanSection';
import PairSection from 'sections/PairSection';
import TokenSection from 'sections/TokenSection';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

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

const Stats = styled(Flex)`
  display: flex;
`;

const StatsItem = styled(Flex)`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;

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
`;

export function StatsPage() {
  const overviewInfo = useOverviewInfo();
  const governanceInfo = useGovernanceInfo();

  return (
    <Container>
      <Helmet>
        <title>Stats</title>
      </Helmet>

      <StyledHeader>
        <Flex alignItems="center" justifyContent="space-between">
          <Logo />

          <Button as="a" target="_blank" href="https://app.balanced.network">
            Go to app
          </Button>
        </Flex>
      </StyledHeader>

      <StatsLayout>
        <BoxPanel bg="bg2">
          <Typography variant="h2" mb={5}>
            Overview
          </Typography>

          <Stats>
            {/* TVL */}
            <StatsItem className="border-right">
              <StatsItemIcon>
                <VaultIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography variant="h3">${overviewInfo.TVL ? overviewInfo.TVL.toFormat() : '-'}</Typography>
                <Typography>Total value locked</Typography>
              </StatsItemData>
            </StatsItem>
            {/* number of Borrowers */}
            <StatsItem className="border-right">
              <StatsItemIcon>
                <CoinsIcon width={53} height={55} />
              </StatsItemIcon>
              <StatsItemData>
                <Typography variant="h3">
                  ${overviewInfo.BALNMarketCap ? overviewInfo.BALNMarketCap.toFormat() : '-'}
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
                <Typography variant="h3">${overviewInfo.fees ? overviewInfo.fees.toFormat() : '-'}</Typography>
                <Typography>Fees earned</Typography>
              </StatsItemData>
            </StatsItem>
            {/* number of transactions */}
            <StatsItem>
              <StatsItemIcon>
                <TransactionsIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography variant="h3">
                  {overviewInfo.transactions
                    ? getFormattedNumber(overviewInfo.transactions['total_transactions'], 'number')
                    : '-'}
                </Typography>
                <Typography>Transactions</Typography>
              </StatsItemData>
            </StatsItem>
          </Stats>
        </BoxPanel>

        <CollateralAndLoanSection />

        <TokenSection />

        <PairSection />

        <BoxPanel bg="bg2" mb={10}>
          <Typography variant="h2" mb={5}>
            Governance
          </Typography>

          <Stats>
            <StatsItem className="border-right">
              <StatsItemIcon>
                <DaoIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography variant="h3">
                  ${governanceInfo.daofund ? governanceInfo.daofund.toFormat() : '-'}
                </Typography>
                <Typography>DAO fund</Typography>
              </StatsItemData>
            </StatsItem>

            <StatsItem className="border-right">
              <StatsItemIcon>
                <StakersIcon width={53} height={55} />
              </StatsItemIcon>
              <StatsItemData>
                <Typography variant="h3">
                  {governanceInfo.numOfStakers ? getFormattedNumber(governanceInfo.numOfStakers, 'number') : '-'}
                </Typography>
                <Typography>BALN stakers</Typography>
              </StatsItemData>
            </StatsItem>

            <StatsItem className="border-right">
              <StatsItemIcon>
                <ChartIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography variant="h3">
                  {governanceInfo.totalStakedBALN ? getFormattedNumber(governanceInfo.totalStakedBALN, 'number') : '-'}{' '}
                </Typography>
                <Typography>BALN staked</Typography>
              </StatsItemData>
            </StatsItem>

            <StatsItem>
              <StatsItemIcon>
                <DistributionIcon width={53} height={55} />
              </StatsItemIcon>

              <StatsItemData>
                <Typography variant="h3">
                  {governanceInfo.dailyDistribution
                    ? getFormattedNumber(governanceInfo.dailyDistribution, 'number')
                    : '-'}{' '}
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
    </Container>
  );
}

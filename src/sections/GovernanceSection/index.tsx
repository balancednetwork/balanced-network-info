import React, { useMemo } from 'react';

import { useGovernanceInfo, useLatestProposals } from 'queries';
import { Box, Flex } from 'rebass';
import styled, { css } from 'styled-components';

import { ReactComponent as ActiveProposalsIcon } from 'assets/icons/active-proposals.svg';
import { ReactComponent as CalendarIcon } from 'assets/icons/calendar-small.svg';
import { ReactComponent as EligibleVotersIcon } from 'assets/icons/eligible-voters.svg';
import { ReactComponent as ParticipationRateIcon } from 'assets/icons/participation-rate.svg';
import { ReactComponent as TotalProposalsIcon } from 'assets/icons/total-proposals.svg';
import Divider from 'components/Divider';
import { BoxPanel, FlexPanel } from 'components/Panel';
// import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { Stats, StatsItem, StatsItemData, StatsItemIcon } from 'pages/StatsPage';
import { StyledSkeleton } from 'sections/TokenSection';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

import { ProposalStatusIcon } from './ProposalStatusLabel';
import { getDateFromDay, normalizeContent } from './utils';

const Grid = styled(Box)`
  display: grid;
  grid-gap: 35px;
  justify-items: stretch;
  grid-template-columns: 1fr 1fr 1fr;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  grid-template-columns: 1fr;
  `};
`;

const ProposalPreview = styled(FlexPanel)<{ noHover?: boolean }>`
  ${({ theme, noHover }) => css`
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;

    &:before {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      border: 3px solid ${theme.colors.primary};
      transition: all 0.3s ease;
      transform: scale(1.033);
      border-radius: 10px;
      opacity: 0;
    }

    ${!noHover &&
    css`
      &:hover {
        &:before {
          transform: scale(1);
          opacity: 1;
        }
      }
    `}
  `};
`;

const IconLabel = ({ icon, content }: { icon: React.ReactNode; content: React.ReactNode }) => {
  return (
    <Flex alignItems="center" sx={{ columnGap: '10px', lineHeight: '35px' }}>
      <>{icon}</>
      <>{content}</>
    </Flex>
  );
};

const VoteStatusLabel = ({ proposal }: { proposal }) => {
  return (
    <div>
      {proposal?.status && proposal['start day'] && proposal['end day'] ? (
        <ProposalStatusIcon status={proposal.status} startDay={proposal['start day']} endDay={proposal['end day']} />
      ) : (
        <Flex alignItems="center" sx={{ columnGap: '10px' }}>
          <StyledSkeleton animation="wave" width={22} variant="circle" />
          <StyledSkeleton animation="wave" width={80} />
        </Flex>
      )}
    </div>
  );
};

const VoteDateEndLabel = ({ proposal }: { proposal }) => {
  return proposal &&
    proposal.status !== 'Active' &&
    proposal.status !== 'Pending' &&
    proposal.status !== 'Cancelled' &&
    proposal['end day'] ? (
    <IconLabel
      icon={<CalendarIcon height="22" width="22" />}
      content={
        <Typography lineHeight={1.4} color="text">
          {getDateFromDay(proposal['end day']).format('MMM DD YYYY')}
        </Typography>
      }
    />
  ) : null;
};

const GovernanceSection = () => {
  const { data: governanceInfo } = useGovernanceInfo();
  const { data: latestProposals } = useLatestProposals();

  const sortedProposals = useMemo(() => (latestProposals ? latestProposals.sort((a, b) => b.id - a.id) : []), [
    latestProposals,
  ]);

  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb="30px">
        Governance
      </Typography>

      <Stats>
        <StatsItem className="border-right">
          <StatsItemIcon>
            <ActiveProposalsIcon width={55} height={55} />
          </StatsItemIcon>
          <StatsItemData>
            <Typography fontWeight="normal" variant="h3">
              {governanceInfo ? <>{governanceInfo.activeProposals}</> : <LoaderComponent />}
            </Typography>
            <Typography>Active proposals</Typography>
          </StatsItemData>
        </StatsItem>

        <StatsItem className="border-right">
          <StatsItemIcon>
            <TotalProposalsIcon width={55} />
          </StatsItemIcon>
          <StatsItemData>
            <Typography fontWeight="normal" variant="h3">
              {governanceInfo ? (
                <>{getFormattedNumber(governanceInfo.totalProposals, 'number')}</>
              ) : (
                <LoaderComponent />
              )}
            </Typography>
            <Typography>Total proposals</Typography>
          </StatsItemData>
        </StatsItem>

        <StatsItem className="border-right">
          <StatsItemIcon>
            <ParticipationRateIcon width={55} />
          </StatsItemIcon>
          <StatsItemData>
            <Typography fontWeight="normal" variant="h3">
              {governanceInfo ? (
                <>{getFormattedNumber(governanceInfo.participationRate, 'percent2')}</>
              ) : (
                <LoaderComponent />
              )}
            </Typography>
            <Typography>Participation rate</Typography>
          </StatsItemData>
        </StatsItem>

        <StatsItem>
          <StatsItemIcon>
            <EligibleVotersIcon width={55} />
          </StatsItemIcon>
          <StatsItemData>
            <Typography fontWeight="normal" variant="h3">
              {governanceInfo ? (
                <>{getFormattedNumber(governanceInfo.eligibleVoters, 'number')}</>
              ) : (
                <LoaderComponent />
              )}
            </Typography>
            <Typography>Eligible voters</Typography>
          </StatsItemData>
        </StatsItem>
      </Stats>
      <Grid mt="30px">
        {sortedProposals.map(proposal => (
          <a
            key={proposal.id}
            href={`https://app.balanced.network/vote/proposal/${parseInt(proposal.id, 16)}`}
            style={{ textDecoration: 'none' }}
            target="_blank"
            rel="noreferrer"
          >
            <ProposalPreview bg="bg3" flexDirection="column">
              <Typography variant="h3" fontSize={16} mt={-1}>
                {proposal.name}
              </Typography>
              <Typography fontSize={14} color="text1" mt={2} mb="auto">
                {proposal.description && normalizeContent(proposal.description, true)}
              </Typography>
              <Divider mt={3} mb={2}></Divider>
              <Flex flexWrap="wrap" alignItems="center" mb={-2}>
                <Box mr={'17px'}>
                  <VoteStatusLabel proposal={proposal} />
                </Box>
                <VoteDateEndLabel proposal={proposal} />
              </Flex>
            </ProposalPreview>
          </a>
        ))}
      </Grid>
    </BoxPanel>
  );
};

export default GovernanceSection;

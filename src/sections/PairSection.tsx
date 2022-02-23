import React from 'react';

import { useAllPairs, useAllPairsTotal } from 'queries';
import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as QuestionIcon } from 'assets/icons/question.svg';
import { ReactComponent as SigmaIcon } from 'assets/icons/sigma.svg';
import Divider from 'components/Divider';
import { BoxPanel } from 'components/Panel';
import { MouseoverTooltip } from 'components/Tooltip';
import { CurrencyKey } from 'constants/currency';
import { Typography } from 'theme';
import { getCurrencyKeyIcon } from 'utils';
import { getFormattedNumber } from 'utils/formatter';

import { StyledSkeleton as Skeleton } from './TokenSection';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-width: 1100px;
`;

const DashGrid = styled(Box)`
  display: grid;
  gap: 1em;
  align-items: center;
  grid-template-columns: 2fr repeat(5, 1fr);
  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1.2fr 0.5fr repeat(4, 1fr);
  `}
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

  &.apy-column {
    padding: 10px 22px 10px 0;
    flex-direction: column;
    align-items: flex-end;
    min-width: 135px;
  }
`;

const FooterText = styled(DataText)`
  font-weight: bold;
`;

const HeaderText = styled(Flex)`
  display: flex;
  font-size: 14px;
  color: #d5d7db;
  letter-spacing: 3px;
  text-transform: uppercase;
  align-items: center;
`;

const APYItem = styled(Flex)`
  align-items: flex-end;
  line-height: 25px;
`;

const StyledSkeleton = styled(Skeleton)`
  &.pool-icon-skeleton {
    position: absolute;
    left: 0;

    &:last-of-type {
      left: 38px;
    }
  }
`;

const IconWrapper = styled(Box)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgb(12, 42, 77);
  background-color: rgb(20, 74, 104);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PoolIconWrapper = styled(Box)`
  display: flex;
  min-width: 80px;
`;

function PoolIcon({
  baseCurrencyKey,
  quoteCurrencyKey,
}: {
  baseCurrencyKey: CurrencyKey;
  quoteCurrencyKey: CurrencyKey;
}) {
  const BaseIcon = getCurrencyKeyIcon(baseCurrencyKey);
  const QuoteIcon = getCurrencyKeyIcon(quoteCurrencyKey);

  return (
    <PoolIconWrapper>
      <IconWrapper>
        <BaseIcon width={25} height={25} />
      </IconWrapper>
      <IconWrapper ml={-2}>
        <QuoteIcon width={25} height={25} />
      </IconWrapper>
    </PoolIconWrapper>
  );
}

function TotalIcon() {
  return (
    <PoolIconWrapper>
      <IconWrapper></IconWrapper>
      <IconWrapper ml="-38px"></IconWrapper>
      <IconWrapper ml="-38px"></IconWrapper>
      <IconWrapper ml="-38px"></IconWrapper>
      <IconWrapper ml="-38px">
        <SigmaIcon width={20} height={20} />
      </IconWrapper>
    </PoolIconWrapper>
  );
}

const SkeletonPariPlaceholder = () => {
  return (
    <DashGrid my={2}>
      <DataText>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '95px', minHeight: '48px', position: 'relative' }}>
            <StyledSkeleton variant="circle" width={48} height={48} className="pool-icon-skeleton" />
            <StyledSkeleton variant="circle" width={48} height={48} className="pool-icon-skeleton" />
          </Box>
          <Text ml={2}>
            <StyledSkeleton width={90} />
          </Text>
        </Flex>
      </DataText>
      <DataText>
        <StyledSkeleton width={50} />
      </DataText>
      <DataText>
        <StyledSkeleton width={70} />
      </DataText>
      <DataText>
        <StyledSkeleton width={100} />
      </DataText>
      <DataText>
        <StyledSkeleton width={100} />
      </DataText>
      <DataText>
        <StyledSkeleton width={70} />
      </DataText>
    </DashGrid>
  );
};

export default function PairSection() {
  const allPairs = useAllPairs();
  const total = useAllPairsTotal();

  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb={5}>
        Exchange
      </Typography>
      <Box overflow="auto">
        <List>
          <DashGrid>
            <HeaderText minWidth={'220px'}>POOL</HeaderText>
            <HeaderText minWidth={'135px'} paddingRight={'22px'}>
              <Typography marginRight={'5px'}>APY</Typography>
              <MouseoverTooltip
                width={330}
                text={
                  <>
                    The BALN APY is calculated from the USD value of BALN rewards available for a pool.
                    <br />
                    <br />
                    The fee APY is calculated from the swap fees earned by a pool in the last 30 days.
                  </>
                }
                placement="top"
              >
                <QuestionIcon className="header-tooltip" width={14} />
              </MouseoverTooltip>
            </HeaderText>
            <HeaderText>PARTICIPANTS</HeaderText>
            <HeaderText>LIQUIDITY</HeaderText>
            <HeaderText>VOLUME (24H)</HeaderText>
            <HeaderText>FEES (24H)</HeaderText>
          </DashGrid>

          {allPairs ? (
            Object.values(allPairs).map(pair => (
              <div key={pair.poolId}>
                <DashGrid my={2}>
                  <DataText minWidth={'220px'}>
                    <Flex alignItems="center">
                      <Box sx={{ minWidth: '95px' }}>
                        <PoolIcon baseCurrencyKey={pair.baseCurrencyKey} quoteCurrencyKey={pair.quoteCurrencyKey} />
                      </Box>
                      <Text ml={2}>{`${pair.baseCurrencyKey} / ${pair.quoteCurrencyKey}`}</Text>
                    </Flex>
                  </DataText>
                  <DataText className="apy-column">
                    {pair.apy && (
                      <APYItem>
                        <Typography color="#d5d7db" fontSize={14} marginRight={'5px'}>
                          BALN:
                        </Typography>
                        {getFormattedNumber(pair.apy, 'percent2')}
                      </APYItem>
                    )}

                    {pair.feesApy !== 0 && (
                      <APYItem>
                        <Typography color="#d5d7db" fontSize={14} marginRight={'5px'}>
                          Fees:
                        </Typography>
                        {getFormattedNumber(pair.feesApy, 'percent2')}
                      </APYItem>
                    )}

                    {!pair.feesApy && !pair.apy && '-'}
                  </DataText>
                  <DataText>{getFormattedNumber(pair.participant, 'number')}</DataText>
                  <DataText>{getFormattedNumber(pair.tvl, 'currency0')}</DataText>
                  <DataText>{getFormattedNumber(pair.volume, 'currency0')}</DataText>
                  <DataText>{getFormattedNumber(pair.fees, 'currency0')}</DataText>
                </DashGrid>
                <Divider />
              </div>
            ))
          ) : (
            <>
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
              <Divider />
              <SkeletonPariPlaceholder />
            </>
          )}

          {total && (
            <DashGrid my={2}>
              <FooterText minWidth={'220px'}>
                <Flex alignItems="center">
                  <Box sx={{ minWidth: '95px' }}>
                    <TotalIcon />
                  </Box>
                  <Text ml={2}>Total</Text>
                </Flex>
              </FooterText>
              <FooterText paddingRight={'22px'} minWidth={'135px'}>
                –
              </FooterText>
              <FooterText>{getFormattedNumber(total.participant, 'number')}</FooterText>
              <FooterText>{getFormattedNumber(total.tvl, 'currency0')}</FooterText>
              <FooterText>{getFormattedNumber(total.volume, 'currency0')}</FooterText>
              <FooterText>{getFormattedNumber(total.fees, 'currency0')}</FooterText>
            </DashGrid>
          )}
        </List>
      </Box>
    </BoxPanel>
  );
}

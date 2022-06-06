import React, { createRef, forwardRef } from 'react';

import { useAllPairs, useAllPairsTotal } from 'queries';
import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as SigmaIcon } from 'assets/icons/sigma.svg';
import AnimateList from 'components/AnimatedList';
import Divider from 'components/Divider';
import { BoxPanel } from 'components/Panel';
import { CurrencyKey, Pair } from 'constants/currency';
import useSort from 'hooks/useSort';
import { Typography } from 'theme';
import { getCurrencyKeyIcon } from 'utils';
import { getFormattedNumber } from 'utils/formatter';

import { HeaderText, StyledSkeleton as Skeleton } from './TokenSection';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-width: 930px;
  overflow: hidden;
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
`;

const FooterText = styled(DataText)`
  font-weight: bold;
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

const SkeletonPairPlaceholder = () => {
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

type PairItemProps = {
  pair: Pair & {
    tvl: number;
    apy: number;
    participant: number;
    volume: number;
    fees: number;
  };
};

const PairItem = forwardRef(({ pair }: PairItemProps, ref) => (
  <>
    <DashGrid my={2} ref={ref}>
      <DataText>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '95px' }}>
            <PoolIcon baseCurrencyKey={pair.baseCurrencyKey} quoteCurrencyKey={pair.quoteCurrencyKey} />
          </Box>
          <Text ml={2}>{`${pair.baseCurrencyKey} / ${pair.quoteCurrencyKey}`}</Text>
        </Flex>
      </DataText>
      <DataText>{pair.apy ? getFormattedNumber(pair.apy, 'percent2') : '-'}</DataText>
      <DataText>{getFormattedNumber(pair.participant, 'number')}</DataText>
      <DataText>{getFormattedNumber(pair.tvl, 'currency0')}</DataText>
      <DataText>{pair.volume ? getFormattedNumber(pair.volume, 'currency0') : '-'}</DataText>
      <DataText>{pair.fees ? getFormattedNumber(pair.fees, 'currency0') : '-'}</DataText>
    </DashGrid>
    <Divider />
  </>
));

export default function PairSection() {
  const allPairs = useAllPairs();
  const total = useAllPairsTotal();
  const { sortBy, handleSortSelect, sortData } = useSort({ key: 'apy', order: 'DESC' });

  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb={5}>
        Exchange
      </Typography>
      <Box overflow="auto">
        <List>
          <DashGrid>
            <HeaderText
              role="button"
              className={sortBy.key === 'baseCurrencyKey' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'baseCurrencyKey',
                })
              }
            >
              <span>POOL</span>
            </HeaderText>
            <HeaderText
              role="button"
              className={sortBy.key === 'apy' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'apy',
                })
              }
            >
              APY
            </HeaderText>
            <HeaderText
              role="button"
              className={sortBy.key === 'participant' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'participant',
                })
              }
            >
              PARTICIPANTS
            </HeaderText>
            <HeaderText
              role="button"
              className={sortBy.key === 'tvl' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'tvl',
                })
              }
            >
              LIQUIDITY
            </HeaderText>
            <HeaderText
              role="button"
              className={sortBy.key === 'volume' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'volume',
                })
              }
            >
              VOLUME (24H)
            </HeaderText>
            <HeaderText
              role="button"
              className={sortBy.key === 'fees' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'fees',
                })
              }
            >
              FEES (24H)
            </HeaderText>
          </DashGrid>

          {allPairs ? (
            <AnimateList>
              {sortData(Object.values(allPairs)).map(pair => (
                <PairItem key={`${pair.baseCurrencyKey}${pair.quoteCurrencyKey}`} ref={createRef()} pair={pair} />
              ))}
            </AnimateList>
          ) : (
            <>
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
              <Divider />
              <SkeletonPairPlaceholder />
            </>
          )}

          {total && (
            <DashGrid my={2}>
              <FooterText>
                <Flex alignItems="center">
                  <Box sx={{ minWidth: '95px' }}>
                    <TotalIcon />
                  </Box>
                  <Text ml={2}>Total</Text>
                </Flex>
              </FooterText>
              <FooterText>–</FooterText>
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

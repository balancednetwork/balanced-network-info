import React from 'react';

import { Pair, useAllPairsById, useAllPairsTotal } from 'queries/backendv2';
import { isMobile } from 'react-device-detect';
import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as QuestionIcon } from 'assets/icons/question.svg';
import { ReactComponent as SigmaIcon } from 'assets/icons/sigma.svg';
import Divider from 'components/Divider';
import { BoxPanel } from 'components/Panel';
import PoolLogo, { IconWrapper, PoolLogoWrapper } from 'components/shared/PoolLogo';
import { MouseoverTooltip } from 'components/Tooltip';
import useSort from 'hooks/useSort';
import useTheme from 'hooks/useTheme';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

import { HeaderText, StyledSkeleton as Skeleton } from './TokenSection';

export const MAX_BOOST = 2.5;

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-width: 1100px;
  overflow: hidden;
`;

const DashGrid = styled(Box)`
  display: grid;
  gap: 1em;
  align-items: center;
  grid-template-columns: 2fr repeat(4, 1fr);
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
    padding: 10px 0;
    flex-direction: column;
    align-items: flex-end;
    min-width: 190px;
  }
`;

const FooterText = styled(DataText)`
  font-weight: bold;
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

const QuestionWrapper = styled(Box)`
  width: 0;
  margin: 0 5px;
  overflow: hidden;
  display: inline;
`;

function TotalIcon() {
  return (
    <PoolLogoWrapper>
      <IconWrapper></IconWrapper>
      <IconWrapper ml="-38px"></IconWrapper>
      <IconWrapper ml="-38px"></IconWrapper>
      <IconWrapper ml="-38px"></IconWrapper>
      <IconWrapper ml="-38px">
        <SigmaIcon width={20} height={20} />
      </IconWrapper>
    </PoolLogoWrapper>
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

// type PairItemProps = {
//   pair: PairInfo & {
//     tvl: number;
//     apy: number;
//     feesApy: number;
//     apyTotal: number;
//     participant: number;
//     volume: number;
//     fees: number;
//   };
// };

const PairItem = ({
  id,
  name,
  baseAddress,
  quoteAddress,
  liquidity,
  fees24h,
  fees30d,
  volume24h,
  volume30d,
  feesApy,
  balnApy,
}: Pair) => (
  <>
    <DashGrid my={2}>
      <DataText minWidth={'220px'}>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '95px' }}>
            <PoolLogo baseCurrency={baseAddress} quoteCurrency={quoteAddress} />
          </Box>
          <Text ml={2}>{name}</Text>
        </Flex>
      </DataText>
      <DataText className="apy-column">
        {' '}
        {balnApy && (
          <APYItem>
            <Typography color="#d5d7db" fontSize={14} marginRight={'5px'}>
              BALN:
            </Typography>
            {`${getFormattedNumber(balnApy, 'percent2')} - ${getFormattedNumber(balnApy * MAX_BOOST, 'percent2')}`}
          </APYItem>
        )}
        {feesApy !== 0 && (
          <APYItem>
            <Typography color="#d5d7db" fontSize={14} marginRight={'5px'}>
              Fees:
            </Typography>
            {getFormattedNumber(feesApy, 'percent2')}
          </APYItem>
        )}
        {!feesApy && '-'}
        {/* {!pair.feesApy && !pair.apy && '-'} */}
      </DataText>
      <DataText>{getFormattedNumber(liquidity, 'currency0')}</DataText>
      <DataText>{volume24h ? getFormattedNumber(volume24h, 'currency0') : '-'}</DataText>
      <DataText>{fees24h ? getFormattedNumber(fees24h, 'currency0') : '-'}</DataText>
    </DashGrid>
    <Divider />
  </>
);

export default function PairSection() {
  // const allPairs = useAllPairs_DEPRECATED();
  const { data: allPairs } = useAllPairsById();
  const { data: pairsTotal } = useAllPairsTotal();
  const { sortBy, handleSortSelect, sortData } = useSort({ key: 'liquidity', order: 'DESC' });
  const theme = useTheme();

  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb={5}>
        Exchange
      </Typography>
      <Box overflow="auto">
        <List>
          <DashGrid>
            <HeaderText
              minWidth={'220px'}
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
              minWidth={'190px'}
              role="button"
              className={sortBy.key === 'apyTotal' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'apyTotal',
                })
              }
            >
              {!isMobile && (
                <MouseoverTooltip
                  width={330}
                  text={
                    <>
                      <Typography>
                        The BALN APY is calculated from the USD value of BALN rewards allocated to a pool. Your rate
                        will vary based on the amount of bBALN you hold.
                      </Typography>
                      <Typography marginTop={'20px'}>
                        The fee APY is calculated from the swap fees earned by a pool in the last 30 days.
                      </Typography>
                      <Typography marginTop={'20px'} color={theme.colors.text1} fontSize={14}>
                        Impermanent loss is not factored in.
                      </Typography>
                    </>
                  }
                  placement="top"
                >
                  <QuestionWrapper onClick={e => e.stopPropagation()}>
                    <QuestionIcon className="header-tooltip" width={14} />
                  </QuestionWrapper>
                </MouseoverTooltip>
              )}
              APY
            </HeaderText>
            <HeaderText
              role="button"
              className={sortBy.key === 'liquidity' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'liquidity',
                })
              }
            >
              LIQUIDITY
            </HeaderText>
            <HeaderText
              role="button"
              className={sortBy.key === 'volume24h' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'volume24h',
                })
              }
            >
              VOLUME (24H)
            </HeaderText>
            <HeaderText
              role="button"
              className={sortBy.key === 'fees24h' ? sortBy.order : ''}
              onClick={() =>
                handleSortSelect({
                  key: 'fees24h',
                })
              }
            >
              FEES (24H)
            </HeaderText>
          </DashGrid>

          {allPairs ? (
            sortData(Object.values(allPairs)).map(pair => <PairItem key={pair.name} {...pair} />)
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

          {pairsTotal && (
            <DashGrid my={2}>
              <FooterText minWidth={'220px'}>
                <Flex alignItems="center">
                  <Box sx={{ minWidth: '95px' }}>
                    <TotalIcon />
                  </Box>
                  <Text ml={2}>Total</Text>
                </Flex>
              </FooterText>
              <FooterText minWidth={'190px'}>–</FooterText>
              <FooterText>{getFormattedNumber(pairsTotal.tvl, 'currency0')}</FooterText>
              <FooterText>{getFormattedNumber(pairsTotal.volume, 'currency0')}</FooterText>
              <FooterText>{getFormattedNumber(pairsTotal.fees, 'currency0')}</FooterText>
            </DashGrid>
          )}
        </List>
      </Box>
    </BoxPanel>
  );
}

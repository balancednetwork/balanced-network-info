import React, { useMemo, useState } from 'react';

import { Skeleton } from '@material-ui/lab';
import { MetaToken } from 'queries';
import { useAllTokensByAddress } from 'queries/backendv2';
import { useMedia } from 'react-use';
import { Flex, Box, Text } from 'rebass/styled-components';
import styled, { css } from 'styled-components';

import Divider from 'components/Divider';
import { UnderlineText } from 'components/DropdownText';
import { BoxPanel } from 'components/Panel';
import SearchInput from 'components/SearchInput';
import { CurrencyLogoFromURI } from 'components/shared/CurrencyLogo';
import useSort from 'hooks/useSort';
import { Typography } from 'theme';
import { formatPriceChange, getFormattedNumber } from 'utils/formatter';

export const COMPACT_ITEM_COUNT = 8;

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-width: 840px;
  overflow: hidden;
`;

const DashGrid = styled(Box)`
  display: grid;
  gap: 1em;
  align-items: center;
  grid-template-columns: 6fr 4fr 4fr 3fr 3fr;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 2fr 2fr 3fr 2fr 2fr;
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

export const HeaderText = styled(Flex)<{ className?: string }>`
  display: flex;
  font-size: 14px;
  color: #d5d7db;
  letter-spacing: 3px;
  text-transform: uppercase;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: all ease 200ms;
  padding-left: 15px;
  white-space: nowrap;

  &:before,
  &:after,
  span:after,
  span:before {
    content: '';
    position: absolute;
    width: 8px;
    height: 2px;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.primary};
    display: inline-block;
    top: 50%;
    transition: all ease 200ms;
    right: 0;
    transform-origin: center;
    opacity: 0;
    transform: rotate(0) translate3d(0, 0, 0);
  }

  ${props =>
    props.className === 'ASC' &&
    css`
      padding-right: 15px;
      padding-left: 0;
      &:before,
      &:after,
      span:after,
      span:before {
        opacity: 1;
      }

      &:before,
      span:before {
        transform: rotate(-45deg) translate3d(-2px, -3px, 0);
      }

      &:after,
      span:after {
        transform: rotate(45deg) translate3d(0px, -1px, 0);
      }
    `};

  ${props =>
    props.className === 'DESC' &&
    css`
      padding-right: 15px;
      padding-left: 15px;
      &:before,
      &:after,
      span:after,
      span:before {
        opacity: 1;
      }

      &:before,
      span:before {
        transform: rotate(45deg) translate3d(-3px, 2px, 0);
      }

      &:after,
      span:after {
        transform: rotate(-45deg) translate3d(1px, 0, 0);
      }
    `};

  &:first-of-type {
    padding-left: 0;
    &::before,
    &::after {
      display: none;
    }

    span {
      position: relative;

      &::before,
      &:after {
        margin-right: -15px;
      }
    }
  }
`;

export const StyledSkeleton = styled(Skeleton)`
  background-color: rgba(44, 169, 183, 0.2) !important;
`;

const SkeletonTokenPlaceholder = () => {
  return (
    <DashGrid my={4}>
      <DataText>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '50px' }}>
            <StyledSkeleton variant="circle" width={40} height={40} />
          </Box>
          <Box ml={2} sx={{ minWidth: '160px' }}>
            <StyledSkeleton width={130} />
            <StyledSkeleton width={70} />
          </Box>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column">
          <Typography variant="p">
            <StyledSkeleton width={80} />
          </Typography>
          <Typography variant="p">
            <StyledSkeleton width={80} />
          </Typography>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
          <Typography variant="p">
            <StyledSkeleton width={120} />
          </Typography>
          <Typography variant="p">
            <StyledSkeleton width={160} />
          </Typography>
        </Flex>
      </DataText>
      <DataText>
        <StyledSkeleton width={110} />
      </DataText>
      <DataText>
        <StyledSkeleton width={90} />
      </DataText>
    </DashGrid>
  );
};

type TokenItemProps = {
  token: MetaToken;
  isLast: boolean;
};

const TokenItem = ({ token, isLast }: TokenItemProps) => (
  <>
    <DashGrid my={4}>
      <DataText>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '50px' }}>
            <CurrencyLogoFromURI address={token.address} size="40px" />
          </Box>
          <Box ml={2} sx={{ minWidth: '160px' }}>
            <Text>{token.name.replace(' TOKEN', ' Token')}</Text>
            <Text color="text1">{token.symbol}</Text>
          </Box>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column">
          <Typography variant="p">{getFormattedNumber(token.price, 'price')}</Typography>
          <Typography variant="p" color={token.price >= token.price_24h ? 'primary' : 'alert'}>
            {formatPriceChange(((token.price - token.price_24h) / token.price_24h) * 100)}
          </Typography>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
          <Typography variant="p">{getFormattedNumber(token.market_cap, 'currency0')}</Typography>
          <Typography variant="p" color="text1">
            {getFormattedNumber(token.total_supply, 'number')} {token.symbol}
          </Typography>
        </Flex>
      </DataText>
      <DataText>{`$${getFormattedNumber(token.liquidity, 'number')}`}</DataText>
      <DataText>{token.symbol === 'ICX' ? '–' : getFormattedNumber(token.holders, 'number')}</DataText>
    </DashGrid>
    {!isLast && <Divider />}
  </>
);

export default React.memo(function TokenSection() {
  const { data: allTokens } = useAllTokensByAddress();
  const { sortBy, handleSortSelect, sortData } = useSort({ key: 'market_cap', order: 'DESC' });
  const [showingExpanded, setShowingExpanded] = useState(false);
  const [searched, setSearched] = useState('');

  const tokens = useMemo(() => {
    if (!allTokens) return [];
    const filteredTokens = Object.values(allTokens).filter(token => {
      const tokenName = token.name.toLowerCase();
      const tokenSymbol = token.symbol.toLowerCase();
      const search = searched.toLowerCase();
      return tokenName.includes(search) || tokenSymbol.includes(search);
    });
    return sortData(filteredTokens);
  }, [allTokens, searched, sortData]);

  const noTokensFound = searched && tokens.length === 0;
  const isSmallScreen = useMedia('(max-width: 800px)');

  return (
    <BoxPanel bg="bg2">
      <Flex justifyContent="space-between" flexWrap="wrap">
        <Typography variant="h2" mb={5} mr="20px">
          Tokens
        </Typography>
        <Box width={isSmallScreen ? '100%' : '285px'} mb={isSmallScreen ? '25px' : 0}>
          <SearchInput value={searched} onChange={e => setSearched(e.target.value)} />
        </Box>
      </Flex>
      <Box overflow="auto">
        <List>
          {!noTokensFound && (
            <DashGrid>
              <HeaderText
                role="button"
                className={sortBy.key === 'name' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'name',
                  })
                }
              >
                <span>ASSET</span>
              </HeaderText>
              <HeaderText
                role="button"
                className={sortBy.key === 'price' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'price',
                  })
                }
              >
                PRICE (24H)
              </HeaderText>
              <HeaderText
                role="button"
                className={sortBy.key === 'market_cap' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'market_cap',
                  })
                }
              >
                MARKETCAP
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
                className={sortBy.key === 'holders' ? sortBy.order : ''}
                onClick={() =>
                  handleSortSelect({
                    key: 'holders',
                  })
                }
              >
                HOLDERS
              </HeaderText>
            </DashGrid>
          )}

          {tokens ? (
            <>
              {tokens.map((token, index, arr) =>
                showingExpanded || index < COMPACT_ITEM_COUNT ? (
                  <TokenItem
                    key={token.symbol}
                    token={token}
                    isLast={index === arr.length - 1 || (!showingExpanded && index === COMPACT_ITEM_COUNT - 1)}
                  />
                ) : null,
              )}
              {noTokensFound && (
                <Typography width="100%" paddingTop="30px" fontSize={16} color="text">
                  No tokens match <strong>{searched}</strong> expression.
                </Typography>
              )}
              {tokens.length > COMPACT_ITEM_COUNT && (
                <Typography fontSize={16} paddingBottom="5px" color="primaryBright" pt="20px">
                  {showingExpanded ? (
                    <UnderlineText onClick={() => setShowingExpanded(false)}>Show less</UnderlineText>
                  ) : (
                    <UnderlineText onClick={() => setShowingExpanded(true)}>Show all tokens</UnderlineText>
                  )}
                </Typography>
              )}
            </>
          ) : (
            <>
              <SkeletonTokenPlaceholder />
              <Divider />
              <SkeletonTokenPlaceholder />
              <Divider />
              <SkeletonTokenPlaceholder />
              <Divider />
              <SkeletonTokenPlaceholder />
              <Divider />
              <SkeletonTokenPlaceholder />
            </>
          )}
        </List>
      </Box>
    </BoxPanel>
  );
});

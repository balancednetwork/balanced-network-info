import React, { createRef, forwardRef, useEffect, useLayoutEffect, useState } from 'react';

import { Skeleton } from '@material-ui/lab';
import { Token, useAllTokens } from 'queries';
import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import Divider from 'components/Divider';
import { BoxPanel } from 'components/Panel';
import { CurrencyKey } from 'constants/currency';
import usePrevious from 'hooks/usePrevious';
import useSort from 'hooks/useSort';
import { Typography } from 'theme';
import { getCurrencyKeyIcon } from 'utils';
import { formatPriceChange, getFormattedNumber } from 'utils/formatter';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-width: 620px;
  overflow: auto;
`;

const DashGrid = styled(Box)`
  display: grid;
  gap: 1em;
  align-items: center;
  grid-template-columns: 2fr repeat(3, 1fr);
  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: repeat(4, 1fr);
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

const HeaderText = styled(Flex)`
  display: flex;
  font-size: 14px;
  color: #d5d7db;
  letter-spacing: 3px;
  text-transform: uppercase;
  align-items: center;
  cursor: pointer;
`;

export const StyledSkeleton = styled(Skeleton)`
  background-color: rgba(44, 169, 183, 0.2) !important;
`;

function CurrencyIcon({ currencyKey }: { currencyKey: CurrencyKey }) {
  const Icon = getCurrencyKeyIcon(currencyKey);

  return <Icon width={40} height={40} />;
}

const calculateBoundingBoxes = children => {
  const boundingBoxes = {};

  React.Children.forEach(children, child => {
    const domNode = child.ref.current;
    const nodeBoundingBox = domNode.getBoundingClientRect();

    boundingBoxes[child.key] = nodeBoundingBox;
  });

  return boundingBoxes;
};

const AnimateList = ({ children }) => {
  const [boundingBox, setBoundingBox] = useState({});
  const [prevBoundingBox, setPrevBoundingBox] = useState({});
  const prevChildren = usePrevious(children);

  useLayoutEffect(() => {
    const newBoundingBox = calculateBoundingBoxes(children);
    setBoundingBox(newBoundingBox);
  }, [children]);

  useLayoutEffect(() => {
    const prevBoundingBox = calculateBoundingBoxes(prevChildren);
    setPrevBoundingBox(prevBoundingBox);
  }, [prevChildren]);

  useEffect(() => {
    const hasPrevBoundingBox = Object.keys(prevBoundingBox).length;

    if (hasPrevBoundingBox) {
      React.Children.forEach(children, child => {
        const domNode = child.ref.current;
        const firstBox = prevBoundingBox[child.key];
        const lastBox = boundingBox[child.key];
        const changeInY = firstBox.top - lastBox.top;

        if (changeInY) {
          requestAnimationFrame(() => {
            // Before the DOM paints, invert child to old position
            domNode.style.transform = `translate3d(0, ${changeInY}px, 0)`;
            domNode.style.transition = 'transform 0s';

            requestAnimationFrame(() => {
              // After the previous frame, remove
              // the transistion to play the animation
              domNode.style.transform = '';
              domNode.style.transition = 'transform 500ms';
            });
          });
        }
      });
    }
  }, [boundingBox, prevBoundingBox, children]);

  return children;
};

const SkeletonTokenPlaceholder = () => {
  return (
    <DashGrid my={4}>
      <DataText>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '50px' }}>
            <StyledSkeleton variant="circle" width={40} height={40} />
          </Box>
          <Box ml={2} sx={{ minWidth: '160px' }}>
            <StyledSkeleton width={160} />
            <StyledSkeleton width={70} />
          </Box>
        </Flex>
      </DataText>
      <DataText>
        <StyledSkeleton width={90} />
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column">
          <Typography variant="p">
            <StyledSkeleton width={90} />
          </Typography>
          <Typography variant="p">
            <StyledSkeleton width={90} />
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
    </DashGrid>
  );
};

export default React.memo(function TokenSection() {
  const allTokens = useAllTokens();
  const { handleSortSelect, sortData } = useSort({ key: 'name', order: 'ASC' });

  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb={5}>
        Tokens
      </Typography>
      <Box overflow="auto">
        <List>
          <DashGrid>
            <HeaderText
              role="button"
              onClick={() =>
                handleSortSelect({
                  key: 'name',
                })
              }
            >
              ASSET
            </HeaderText>
            <HeaderText
              role="button"
              onClick={() =>
                handleSortSelect({
                  key: 'holders',
                })
              }
            >
              HOLDERS
            </HeaderText>
            <HeaderText
              role="button"
              onClick={() =>
                handleSortSelect({
                  key: 'priceChange',
                })
              }
            >
              PRICE (24H)
            </HeaderText>
            <HeaderText
              role="button"
              onClick={() =>
                handleSortSelect({
                  key: 'marketCap',
                })
              }
            >
              MARKETCAP
            </HeaderText>
          </DashGrid>

          {allTokens ? (
            <AnimateList>
              {sortData(Object.values(allTokens)).map((token, index, arr) => (
                <TokenItem key={token.symbol} ref={createRef()} token={token} isLast={index === arr.length - 1} />
              ))}
            </AnimateList>
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
              <Divider />
              <SkeletonTokenPlaceholder />
              <Divider />
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

type TokenItemProps = {
  token: Token;
  isLast: boolean;
};

const TokenItem = forwardRef(({ token, isLast }: TokenItemProps, ref) => (
  <>
    <DashGrid my={4} ref={ref}>
      <DataText>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '50px' }}>
            <CurrencyIcon currencyKey={token.symbol} />
          </Box>
          <Box ml={2} sx={{ minWidth: '160px' }}>
            <Text>{token.name}</Text>
            <Text color="text1">{token.symbol}</Text>
          </Box>
        </Flex>
      </DataText>
      <DataText>{token.symbol === 'ICX' ? '–' : getFormattedNumber(token.holders, 'number')}</DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column">
          <Typography variant="p">{getFormattedNumber(token.price, 'price')}</Typography>
          <Typography variant="p" color={token.priceChange >= 0 ? 'primary' : 'alert'}>
            {formatPriceChange(token.priceChange)}
          </Typography>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
          <Typography variant="p">{getFormattedNumber(token.marketCap, 'currency0')}</Typography>
          <Typography variant="p" color="text1">
            {getFormattedNumber(token.totalSupply, 'number')} {token.symbol}
          </Typography>
        </Flex>
      </DataText>
    </DashGrid>
    {!isLast && <Divider />}
  </>
));

import React from 'react';

import { useAllTokens } from 'queries';
import { Link } from 'react-router-dom';
import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import arrowIcon from 'assets/icons/arrow.svg';
import CurrencyIcon from 'components/CurrencyIcon';
import Divider from 'components/Divider';
import { BoxPanel } from 'components/Panel';
import { Typography } from 'theme';
import { formatPriceChange, getFormattedNumber } from 'utils/formatter';

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-width: 550px;
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
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #fff;
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
    top: 7px;
    right: 0;
    transform: translate3d(5px, 0, 0);
    transition: transform 0.3s ease;
  }

  svg,
  img {
    transition: transform 0.3s ease;
    transform: scale(1);
    min-width: 40px;
  }

  &:hover {
    &:after {
      transform: translate3d(15px, 0, 0);
    }

    svg,
    img {
      transform: scale(1.07);
    }
  }
`;

const TokenName = styled(Box)`
  margin-left: 15px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 130px;
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 80px
  `}
`;

export default function TokenSection() {
  const allTokens = useAllTokens();

  return (
    <BoxPanel bg="bg2">
      <Typography variant="h2" mb={5}>
        Tokens
      </Typography>
      <Box overflow="auto">
        <List>
          <DashGrid>
            <HeaderText>ASSET</HeaderText>
            <HeaderText>HOLDERS</HeaderText>
            <HeaderText>PRICE (24H)</HeaderText>
            <HeaderText>MARKETCAP</HeaderText>
          </DashGrid>

          {allTokens &&
            Object.values(allTokens).map((token, index, arr) => (
              <div key={token.symbol}>
                <DashGrid my={4}>
                  <DataText>
                    <StyledLink to={`info-${token.symbol.toLowerCase()}`}>
                      <Flex alignItems="center">
                        <CurrencyIcon currencyKey={token.symbol} width={40} height={40} />
                        <TokenName>
                          <Text>{token.name}</Text>
                          <Text color="text1">{token.symbol}</Text>
                        </TokenName>
                      </Flex>
                    </StyledLink>
                  </DataText>
                  <DataText>{token.symbol === 'ICX' ? '–' : getFormattedNumber(token.holders, 'number')}</DataText>
                  <DataText>
                    <Flex alignItems="flex-end" flexDirection="column">
                      <Typography variant="p">{getFormattedNumber(token.price, 'currency2')}</Typography>
                      <Typography variant="p" color={token.priceChange >= 0 ? 'primary' : 'alert'}>
                        {formatPriceChange(token.priceChange)}
                      </Typography>
                    </Flex>
                  </DataText>
                  <DataText>
                    <Flex alignItems="flex-end" flexDirection="column">
                      <Typography variant="p">{getFormattedNumber(token.marketCap, 'currency0')}</Typography>
                      <Typography variant="p" color="text1">
                        {getFormattedNumber(token.totalSupply, 'number')} {token.symbol}
                      </Typography>
                    </Flex>
                  </DataText>
                </DashGrid>

                {index !== arr.length - 1 && <Divider />}
              </div>
            ))}
        </List>
      </Box>
    </BoxPanel>
  );
}

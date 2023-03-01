import React, { Fragment, useMemo } from 'react';

import { useMedia } from 'react-use';
import { Box, Flex } from 'rebass';
import styled from 'styled-components';

import Divider from 'components/Divider';
import { StyledSkeleton } from 'sections/TokenSection';
import { useStabilityFundTotal, useTokensCollateralData, useTotalCollateral } from 'store/collateral/hooks';
import { Typography } from 'theme';

import CollateralIcon from './CollateralIcon';

const CollateralTypesGrid = styled.div<{
  border?: boolean;
  negativeMargin?: boolean;
  hideCollateralInfoColumn?: boolean;
}>`
  display: grid;
  grid-template-columns: 2fr 1fr;
  width: 100%;
  ${({ border }) => (border ? 'border-bottom: 1px solid #304a68;' : '')}
  ${({ negativeMargin }) => (negativeMargin ? 'margin-top: -10px;' : '')}
  transition: transform ease .3s;

  .white,
  .grey {
    transition: all ease-out 0.2s;
  }

  .white {
    color: #ffffff;
  }

  .grey {
    color: #d5d7db;
  }

  &:hover {
    .white,
    .grey {
      color: ${({ theme }) => theme.colors.primaryBright} !important;
    }
  }
`;

const CollateralTypesGridHeader = styled.div`
  text-transform: uppercase;
  text-align: right;
  font-size: 14px;
  letter-spacing: 3px;
  padding-bottom: 10px;
  color: ${({ theme }) => theme.colors.text1};

  &:first-of-type {
    text-align: left;
  }
`;

const CollateralTypesGridItem = styled(Flex)`
  text-align: right;
  font-size: 14px;
  padding: 20px 0 20px 10px;
  align-items: center;
  cursor: pointer;

  &:first-of-type {
    text-align: left;
    padding: 20px 0;
  }

  &:last-of-type {
    margin-left: auto;
  }

  &.respo {
    width: 100%;
    text-align: left;
    padding-left: 40px;
    margin-top: -35px;
  }
`;

const GridWrap = styled.div`
  max-height: 305px;
  overflow-y: auto;
  padding: 0 25px;

  &.respo {
    ${CollateralTypesGrid} {
      display: flex;
      flex-wrap: wrap;
    }

    img {
      position: relative;
      top: 1px;
    }
  }
`;

export const predefinedCollateralTypes = Object.freeze({
  ALL: 'All',
  STABILITY_FUND: 'Stability Fund',
});

const CollateralTypeList = ({ width, setAnchor, anchor, setCollateral, ...rest }) => {
  const fundInfo = useStabilityFundTotal();
  const { data: tokensCollateralData } = useTokensCollateralData();
  const totalCollateral = useTotalCollateral();
  const isSmall = useMedia('(max-width: 460px)');
  const sortedTokensCollateral = useMemo(
    () => tokensCollateralData && tokensCollateralData.sort((a, b) => b.tvl.minus(a.tvl).toNumber()),
    [tokensCollateralData],
  );

  const handleCollateralSelect = collateral => {
    setCollateral(collateral);
    setAnchor(null);
  };

  return (
    <Box p={'25px 0 5px'} width={width} className="collateral-dropdown">
      <GridWrap>
        <CollateralTypesGrid>
          <CollateralTypesGridHeader>Collateral Type</CollateralTypesGridHeader>
          {!isSmall && <CollateralTypesGridHeader>Value</CollateralTypesGridHeader>}
        </CollateralTypesGrid>
      </GridWrap>

      <GridWrap className={isSmall ? 'respo' : ''}>
        <CollateralTypesGrid onClick={() => handleCollateralSelect(predefinedCollateralTypes.ALL)}>
          <CollateralTypesGridItem>
            <CollateralIcon icon="all" />
            <Typography fontSize={16} fontWeight="bold" className="white">
              {predefinedCollateralTypes.ALL}
            </Typography>
          </CollateralTypesGridItem>
          <CollateralTypesGridItem className={isSmall ? 'respo' : ''}>
            <Typography className="white" fontSize={16}>
              {totalCollateral ? `$${totalCollateral.toFormat(0)}` : <StyledSkeleton width={120} animation="wave" />}
            </Typography>
          </CollateralTypesGridItem>
        </CollateralTypesGrid>
        <Divider />
        {sortedTokensCollateral &&
          sortedTokensCollateral.map(item => (
            <Fragment key={item.symbol}>
              <CollateralTypesGrid onClick={() => handleCollateralSelect(item.symbol)}>
                <CollateralTypesGridItem>
                  <CollateralIcon icon={item.symbol} />
                  <Typography fontSize={16} fontWeight="bold" className="white">
                    {item.symbol === 'sICX' ? 'ICON' : item.symbol}
                  </Typography>
                </CollateralTypesGridItem>
                <CollateralTypesGridItem alignItems="flex-end" className={isSmall ? 'respo' : ''}>
                  <Flex flexDirection="column">
                    <Typography className="white" fontSize={16}>
                      ${item.tvl.toFormat(0)}
                    </Typography>
                    <Typography opacity={0.75} className="grey">
                      {item.amount.toFormat(item.amount.isGreaterThan(100) ? 0 : 2)} {item.symbol}
                    </Typography>
                  </Flex>
                </CollateralTypesGridItem>
              </CollateralTypesGrid>
              <Divider />
            </Fragment>
          ))}
        <CollateralTypesGrid onClick={() => handleCollateralSelect(predefinedCollateralTypes.STABILITY_FUND)}>
          <CollateralTypesGridItem>
            <CollateralIcon icon="Stability fund" />
            <Typography fontSize={16} fontWeight="bold" className="white">
              {predefinedCollateralTypes.STABILITY_FUND}
            </Typography>
          </CollateralTypesGridItem>
          <CollateralTypesGridItem className={isSmall ? 'respo' : ''}>
            <Typography className="white" fontSize={16}>
              {fundInfo && fundInfo.total ? (
                `$${fundInfo.total.toFormat(0)}`
              ) : (
                <StyledSkeleton width={120} animation="wave" />
              )}
            </Typography>
          </CollateralTypesGridItem>
        </CollateralTypesGrid>
      </GridWrap>
    </Box>
  );
};

export default CollateralTypeList;

import React, { useEffect, useCallback } from 'react';

import { useMedia } from 'react-use';
import { Box } from 'rebass';
import styled from 'styled-components';

import CurrencyLogo from 'components/shared/CurrencyLogo';
import { SUPPORTED_TOKENS_LIST } from 'constants/tokens';
import { Typography } from 'theme';

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
      color: ${({ theme }) => theme.colors.primaryBright};
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

const CollateralTypesGridItem = styled.div`
  text-align: right;
  font-size: 14px;
  padding: 20px 0 20px 10px;
  cursor: pointer;

  &:first-of-type {
    text-align: left;
    padding: 20px 0;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  padding-left: 40px;

  img {
    position: absolute;
    left: 0;
  }

  @media screen and (max-width: 350px) {
    padding-left: 0;
    img {
      display: none;
    }
  }
`;

const GridWrap = styled.div`
  max-height: 305px;
  overflow-y: auto;
  padding: 0 25px;
`;

const CollateralTypeList = ({ width, setAnchor, anchor, ...rest }) => {
  const hideCollateralInfoColumn = useMedia('(max-width: 500px)');

  const handleCollateralTypeChange = useCallback(
    symbol => {
      setAnchor(null);
    },
    [setAnchor],
  );

  return (
    <Box p={'25px 0 5px'} width={width}>
      {true ? (
        <GridWrap>
          <CollateralTypesGrid>
            <CollateralTypesGridHeader>Collateral Type</CollateralTypesGridHeader>
            <CollateralTypesGridHeader>Value</CollateralTypesGridHeader>
          </CollateralTypesGrid>
        </GridWrap>
      ) : null}

      <GridWrap>
        <CollateralTypesGrid onClick={() => handleCollateralTypeChange('symbol')}>
          <CollateralTypesGridItem>item</CollateralTypesGridItem>
        </CollateralTypesGrid>
      </GridWrap>
    </Box>
  );
};

export default CollateralTypeList;

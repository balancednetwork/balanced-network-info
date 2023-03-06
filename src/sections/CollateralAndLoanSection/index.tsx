import React, { useCallback, useState } from 'react';

import { Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import { DEFAULT_HEIGHT } from 'components/LineChart';
import { BoxPanel } from 'components/Panel';

import BnUSDChart from './BnUSDChart';
import CollateralChart from './CollateralChart';

export const ChartSection = styled(Box)`
  box-sizing: border-box;
  margin: 0px;
  min-width: 0px;
  width: 100%;
  display: flex;
  padding: 0px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  column-gap: 50px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    row-gap: 50px;
  `}
`;

export const ChartPanel = styled(BoxPanel)`
  width: 100%;
`;

export const ChartContainer = styled(Box)`
  position: relative;
  height: ${DEFAULT_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function CollateralAndLoanSection() {
  const [selectedCollateral, setSelectedCollateral] = useState<string>(predefinedCollateralTypes.ALL);
  const setCollateral = useCallback(collateral => setSelectedCollateral(collateral), [setSelectedCollateral]);

  return (
    <ChartSection>
      <CollateralChart selectedCollateral={selectedCollateral} setCollateral={setCollateral}></CollateralChart>
      <BnUSDChart selectedCollateral={selectedCollateral}></BnUSDChart>
    </ChartSection>
  );
}

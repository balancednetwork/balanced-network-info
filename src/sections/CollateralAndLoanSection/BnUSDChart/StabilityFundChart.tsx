import React, { useEffect, useMemo } from 'react';

import useHistoryFor, {
  useHistoryForBnUSDTotalSupply,
  useHistoryForStabilityFund,
  useHistoryForTotal,
} from 'queries/historicalData';
import { getCollateralParams, getMintedAgainstParams } from 'queries/historicalData/predefinedOptions';

import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import MultiLineChart, { DEFAULT_HEIGHT } from 'components/MultiLineChart';
import Spinner from 'components/Spinner';
import useTheme from 'hooks/useTheme';
import { useSupportedCollateralTokens } from 'store/collateral/hooks';

import { ChartContainer } from '..';

export default function Chart({
  collateralTVLHover,
  collateralLabel,
  setCollateralTVLHover,
  setCollateralLabel,
  setUserHovering,
}) {
  const theme = useTheme();
  const { data: collateralTokens } = useSupportedCollateralTokens();
  const { data: historyDataStabilityFund } = useHistoryForStabilityFund();

  return (
    <>
      <ChartContainer
        onMouseEnter={() => setUserHovering(true)}
        onMouseLeave={() => setUserHovering(false)}
        onTouchStart={() => setUserHovering(true)}
        onTouchEnd={() => setUserHovering(false)}
      >
        {historyDataStabilityFund ? (
          <MultiLineChart
            data={historyDataStabilityFund.stacked}
            height={DEFAULT_HEIGHT}
            minHeight={DEFAULT_HEIGHT}
            color={theme.colors.primary}
            value={collateralTVLHover}
            label={collateralLabel}
            setValue={setCollateralTVLHover}
            setLabel={setCollateralLabel}
          />
        ) : (
          <Spinner size={75} />
        )}
      </ChartContainer>
    </>
  );
}

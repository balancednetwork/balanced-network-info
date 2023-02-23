import React, { useMemo } from 'react';

import useHistoryFor, { useHistoryForBnUSDTotalSupply } from 'queries/historicalData';
import { getMintedAgainstParams } from 'queries/historicalData/predefinedOptions';

import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import Spinner from 'components/Spinner';
import useTheme from 'hooks/useTheme';
import { useSupportedCollateralTokens } from 'store/collateral/hooks';

import { ChartContainer } from '..';

export default function Chart({
  selectedCollateral,
  collateralTVLHover,
  collateralLabel,
  setCollateralTVLHover,
  setCollateralLabel,
  setUserHovering,
}) {
  const theme = useTheme();
  const { data: collateralTokens } = useSupportedCollateralTokens();
  const isPredefinedType =
    selectedCollateral === predefinedCollateralTypes.ALL ||
    selectedCollateral === predefinedCollateralTypes.STABILITY_FUND;

  const params = useMemo(() => {
    if (!isPredefinedType && collateralTokens && collateralTokens[selectedCollateral]) {
      return getMintedAgainstParams(selectedCollateral, collateralTokens[selectedCollateral]);
    }
  }, [isPredefinedType, selectedCollateral, collateralTokens]);

  const isPredefinedCollateral =
    selectedCollateral === predefinedCollateralTypes.ALL ||
    selectedCollateral === predefinedCollateralTypes.STABILITY_FUND;

  const { data: historyData } = useHistoryFor(params);
  const { data: historyForBnUSDTotalSupply } = useHistoryForBnUSDTotalSupply();

  const isDataReady =
    (selectedCollateral === predefinedCollateralTypes.ALL && historyForBnUSDTotalSupply) ||
    (!isPredefinedCollateral && historyData);

  return (
    <>
      <ChartContainer
        onMouseEnter={() => setUserHovering(true)}
        onMouseLeave={() => setUserHovering(false)}
        onTouchStart={() => setUserHovering(true)}
        onTouchEnd={() => setUserHovering(false)}
      >
        {isDataReady ? (
          <LineChart
            data={selectedCollateral === predefinedCollateralTypes.ALL ? historyForBnUSDTotalSupply : historyData}
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

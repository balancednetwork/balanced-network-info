import React, { useMemo } from 'react';

import useHistoryFor, { useHistoryForStabilityFund, useHistoryForTotal } from 'queries/historicalData';
import { getCollateralParams } from 'queries/historicalData/predefinedOptions';

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
    if (isPredefinedType) {
      return getCollateralParams(selectedCollateral);
    } else if (collateralTokens) {
      return getCollateralParams(collateralTokens[selectedCollateral]);
    }
  }, [isPredefinedType, selectedCollateral, collateralTokens]);

  const isPredefinedCollateral =
    selectedCollateral === predefinedCollateralTypes.ALL ||
    selectedCollateral === predefinedCollateralTypes.STABILITY_FUND;

  const { data: historyData } = useHistoryFor(params);
  const { data: historyDataStabilityFund } = useHistoryForStabilityFund();
  const { data: historyDataTotal } = useHistoryForTotal();

  const isDataReady =
    (selectedCollateral === predefinedCollateralTypes.ALL && historyDataTotal) ||
    (selectedCollateral === predefinedCollateralTypes.STABILITY_FUND && historyDataStabilityFund) ||
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
            data={
              selectedCollateral === predefinedCollateralTypes.ALL
                ? historyDataTotal
                : selectedCollateral === predefinedCollateralTypes.STABILITY_FUND
                ? historyDataStabilityFund?.total
                : historyData
            }
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

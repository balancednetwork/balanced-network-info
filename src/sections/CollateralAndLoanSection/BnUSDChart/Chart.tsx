import React, { useEffect, useMemo } from 'react';

import useHistoryFor, { useHistoryForBnUSDTotalSupply, useHistoryForStabilityFund } from 'queries/historicalData';
import { getMintedAgainstParams } from 'queries/historicalData/predefinedOptions';

import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import Spinner from 'components/Spinner';
import { useSupportedCollateralTokens } from 'store/collateral/hooks';

import { ChartContainer } from '..';

export default function Chart({
  selectedCollateral,
  collateralTVLHover,
  collateralLabel,
  setCollateralTVLHover,
  setCollateralLabel,
  setTotalBnUSD,
  setUserHovering,
}) {
  const { data: collateralTokens } = useSupportedCollateralTokens();
  const isPredefinedType =
    selectedCollateral === predefinedCollateralTypes.ALL ||
    selectedCollateral === predefinedCollateralTypes.STABILITY_FUND;

  const params = useMemo(() => {
    if (!isPredefinedType && collateralTokens && collateralTokens[selectedCollateral]) {
      return getMintedAgainstParams(selectedCollateral, collateralTokens[selectedCollateral]);
    }
  }, [isPredefinedType, selectedCollateral, collateralTokens]);

  const { data: historyData } = useHistoryFor(params);
  const { data: historyForBnUSDTotalSupply } = useHistoryForBnUSDTotalSupply();
  const { data: historyForStabilityFund } = useHistoryForStabilityFund();

  const data = useMemo(
    () =>
      selectedCollateral === predefinedCollateralTypes.ALL
        ? historyForBnUSDTotalSupply
        : selectedCollateral === predefinedCollateralTypes.STABILITY_FUND && historyForStabilityFund
        ? historyForStabilityFund.total
        : historyData,
    [historyData, historyForBnUSDTotalSupply, historyForStabilityFund, selectedCollateral],
  );

  useEffect(() => {
    if (data) {
      setTotalBnUSD(data[data.length - 1].value);
    }
  }, [data, setTotalBnUSD]);

  return (
    <>
      <ChartContainer
        onMouseEnter={() => setUserHovering(true)}
        onMouseLeave={() => setUserHovering(false)}
        onTouchStart={() => setUserHovering(true)}
        onTouchEnd={() => setUserHovering(false)}
      >
        {data ? (
          <LineChart
            data={data}
            height={DEFAULT_HEIGHT}
            minHeight={DEFAULT_HEIGHT}
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

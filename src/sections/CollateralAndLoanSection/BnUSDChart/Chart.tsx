import React, { useEffect } from 'react';

import { useContractMethodsDataQuery } from 'queries/backendv2';

import bnJs from 'bnJs';
import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import Spinner from 'components/Spinner';

import { ChartContainer } from '..';

export default function Chart({
  collateralTVLHover,
  collateralLabel,
  setCollateralTVLHover,
  setCollateralLabel,
  setTotalBnUSD,
  setUserHovering,
}) {
  // const { data: collateralTokens } = useSupportedCollateralTokens();
  // const isPredefinedType =
  //   selectedCollateral === predefinedCollateralTypes.ALL ||
  //   selectedCollateral === predefinedCollateralTypes.STABILITY_FUND;

  // const params = useMemo(() => {
  //   if (!isPredefinedType && collateralTokens && collateralTokens[selectedCollateral]) {
  //     return getMintedAgainstParams(selectedCollateral, collateralTokens[selectedCollateral]);
  //   }
  // }, [isPredefinedType, selectedCollateral, collateralTokens]);

  // const { data: historyData } = useHistoryFor(params);
  // const { data: historyForBnUSDTotalSupply } = useHistoryForBnUSDTotalSupply();
  // const { data: historyForStabilityFund } = useHistoryForStabilityFund();

  // const data = useMemo(
  //   () =>
  //     selectedCollateral === predefinedCollateralTypes.ALL
  //       ? historyForBnUSDTotalSupply
  //       : selectedCollateral === predefinedCollateralTypes.STABILITY_FUND && historyForStabilityFund
  //       ? historyForStabilityFund.total
  //       : historyData,
  //   [historyData, historyForBnUSDTotalSupply, historyForStabilityFund, selectedCollateral],
  // );
  const { data: bnUSDChartData } = useContractMethodsDataQuery(bnJs.bnUSD.address, 'totalSupply');

  useEffect(() => {
    if (bnUSDChartData) {
      setTotalBnUSD(bnUSDChartData[bnUSDChartData.length - 1].value);
    }
  }, [bnUSDChartData, setTotalBnUSD]);

  return (
    <>
      <ChartContainer
        onMouseEnter={() => setUserHovering(true)}
        onMouseLeave={() => setUserHovering(false)}
        onTouchStart={() => setUserHovering(true)}
        onTouchEnd={() => setUserHovering(false)}
      >
        {bnUSDChartData ? (
          <LineChart
            data={bnUSDChartData}
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

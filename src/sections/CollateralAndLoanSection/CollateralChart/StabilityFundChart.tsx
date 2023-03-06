import React from 'react';

import { useHistoryForStabilityFund } from 'queries/historicalData';

import MultiLineChart, { DEFAULT_HEIGHT } from 'components/MultiLineChart';
import Spinner from 'components/Spinner';
import useTheme from 'hooks/useTheme';

import { ChartContainer } from '..';

export default function Chart({
  collateralTVLHover,
  collateralLabel,
  setCollateralTVLHover,
  setCollateralLabel,
  setTotalStabilityFundBnUSD,
  setUserHovering,
}) {
  const theme = useTheme();
  const { data: historyDataStabilityFund } = useHistoryForStabilityFund();

  React.useEffect(() => {
    setTotalStabilityFundBnUSD(historyDataStabilityFund?.total[historyDataStabilityFund?.total.length - 1].value);
  }, [historyDataStabilityFund, setTotalStabilityFundBnUSD]);

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

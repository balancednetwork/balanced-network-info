import React, { useEffect, useMemo } from 'react';

import { useAllCollateralData, useCollateralDataFor } from 'queries/backendv2';

import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import Spinner from 'components/Spinner';
import useTheme from 'hooks/useTheme';

import { ChartContainer } from '..';
import { timeFrames } from '../TimeFrameSelector';

export default function Chart({
  selectedCollateral,
  collateralTVLHover,
  collateralLabel,
  selectedTimeFrame,
  setCollateralTVLHover,
  setCollateralLabel,
  setUserHovering,
  setCollateralChange,
  setTotalCollateral,
}) {
  const theme = useTheme();
  const { data: collateralData } = useCollateralDataFor(selectedTimeFrame.days);

  const seriesData = useMemo(() => {
    if (selectedCollateral === predefinedCollateralTypes.ALL) {
      return collateralData?.series.total;
    } else {
      return collateralData?.series[selectedCollateral];
    }
  }, [collateralData, selectedCollateral]);

  const seriesTotal = collateralData?.series.total;

  useEffect(() => {
    if (seriesTotal) {
      const valueNow = seriesTotal[seriesTotal.length - 1].value;
      const valuePrev = seriesTotal[seriesTotal.length - 7].value;

      setCollateralChange(valueNow / valuePrev - 1);
      setTotalCollateral(valueNow);
    }
  }, [seriesTotal, setCollateralChange, setTotalCollateral]);

  return (
    <>
      <ChartContainer
        onMouseEnter={() => setUserHovering(true)}
        onMouseLeave={() => setUserHovering(false)}
        onTouchStart={() => setUserHovering(true)}
        onTouchEnd={() => setUserHovering(false)}
      >
        {seriesData ? (
          <LineChart
            data={seriesData}
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

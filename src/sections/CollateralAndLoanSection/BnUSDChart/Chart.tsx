import React, { useEffect, useMemo } from 'react';

import { useCollateralDataFor, useDebtDataFor } from 'queries/backendv2';

import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import Spinner from 'components/Spinner';

import { ChartContainer } from '..';

export default function Chart({
  collateralTVLHover,
  collateralLabel,
  selectedTimeFrame,
  selectedCollateral,
  setCollateralTVLHover,
  setCollateralLabel,
  setTotalBnUSD,
  setUserHovering,
}) {
  const { data: debtData } = useDebtDataFor(selectedTimeFrame.days);
  // const { data: collateralData } = useCollateralDataFor(selectedTimeFrame.days);

  // console.log('debtData', debtData);

  // const data = useMemo(() => {
  //   if (selectedCollateral === predefinedCollateralTypes.STABILITY_FUND) {
  //     return collateralData?.series.fundTotal;
  //   } else {
  //     return debtData?.[selectedCollateral];
  //   }
  // }, [debtData, collateralData, selectedCollateral]);

  const data = useMemo(() => {
    return debtData?.['All'];
  }, [debtData]);

  useEffect(() => {
    if (data && data[data.length - 1]) {
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

import React from 'react';
import { ChartInfo, ChartInfoItem } from 'sections/BALNSection/DistributionChart';
import { Typography } from 'theme';

const NetworkOwnedLiquidity = () => {
  return (
    <>
      <Typography variant="h3" mb="25px">
        Network-owned liquidity
      </Typography>
      <ChartInfo mt="25px">
        <ChartInfoItem border>
          <Typography fontSize={18} color="text">
            $10,432
          </Typography>
          <Typography fontSize={14} color="text1">
            Total value
          </Typography>
        </ChartInfoItem>
        <ChartInfoItem>
          <Typography fontSize={18} color="text">
            {/* {totalSupply ? totalSupply.toFormat(0) : <LoaderComponent />} */}
            $1,233
          </Typography>
          <Typography fontSize={14} color="text1">
            Supplied past month
          </Typography>
        </ChartInfoItem>
      </ChartInfo>
    </>
  );
};

export default NetworkOwnedLiquidity;

import React from 'react';
import { Flex } from 'rebass';
import { ChartInfo, ChartInfoItem } from 'sections/BALNSection/DistributionChart';
import { Typography } from 'theme';

const ICXBurn = () => {
  return (
    <>
      <Flex justifyContent="space-between">
        <Typography variant="h3" mr="10px">
          ICX burned
        </Typography>
        <Typography fontSize={20} fontWeight="bold" color="text">
          1,234 ICX
        </Typography>
      </Flex>

      <ChartInfo mt="25px">
        <ChartInfoItem border>
          <Typography fontSize={18} color="text">
            8,432 ICX
          </Typography>
          <Typography fontSize={14} color="text1">
            Awaiting burn
          </Typography>
        </ChartInfoItem>
        <ChartInfoItem>
          <Typography fontSize={18} color="text">
            {/* {totalSupply ? totalSupply.toFormat(0) : <LoaderComponent />} */}
            1,233 ICX
          </Typography>
          <Typography fontSize={14} color="text1">
            Burned past month
          </Typography>
        </ChartInfoItem>
      </ChartInfo>
    </>
  );
};

export default ICXBurn;

import Divider from 'components/Divider';
import { CurrencyLogoFromURI } from 'components/shared/CurrencyLogo';
import { HIGH_PRICE_ASSET_DP } from 'constants/tokens';
import { useWithdrawalsFloorDEXData } from 'queries';
import React, { Fragment } from 'react';
import { Box, Flex } from 'rebass';
import { HeaderText } from 'sections/TokenSection';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';
import { DashGrid, DataText, MinWidthContainer, SkeletonTokenPlaceholder } from '../CollateralLimits';

const ExchangeLimits = () => {
  const { data: withdrawalsFloorData } = useWithdrawalsFloorDEXData();

  return (
    <Box overflow="auto">
      <MinWidthContainer>
        <DashGrid>
          <HeaderText>Asset</HeaderText>
          <HeaderText>Liquidity</HeaderText>
          <HeaderText>Security floor</HeaderText>
          <HeaderText>Available to withdraw</HeaderText>
        </DashGrid>
        {withdrawalsFloorData ? (
          <>
            {withdrawalsFloorData?.assetFloorData.map((collateral, index) => {
              const isLast = index === withdrawalsFloorData.assetFloorData.length - 1;
              const dp = HIGH_PRICE_ASSET_DP[collateral.token.address] || 0;
              const availableRatio = collateral.current.minus(collateral.floor).div(collateral.current);

              return (
                <Fragment key={index}>
                  <DashGrid my="10px" key={index}>
                    <DataText>
                      <Flex alignItems="center">
                        <Box sx={{ minWidth: '50px' }}>
                          <CurrencyLogoFromURI address={collateral.token.address} size="40px" />
                        </Box>
                        <Box ml={2} sx={{ minWidth: '160px' }}>
                          <Typography fontSize={16}>{collateral.token.name.replace(' TOKEN', ' Token')}</Typography>
                          <Typography color="text1" fontSize={16}>
                            {collateral.token.symbol}
                          </Typography>
                        </Box>
                      </Flex>
                    </DataText>
                    <DataText>
                      <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
                        <Typography fontSize={16}>{`$${collateral.current
                          .times(collateral.token.price)
                          .toFormat(0)}`}</Typography>
                        <Typography color="text1">
                          {`${collateral.current.toFormat(dp)} ${collateral.token.symbol}`}
                        </Typography>
                      </Flex>
                    </DataText>
                    <DataText>
                      <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
                        <Typography fontSize={16}>{`$${collateral.floor
                          .times(collateral.token.price)
                          .toFormat(0)}`}</Typography>
                        <Typography color="text1">
                          {`${collateral.floor.toFormat(dp)} ${collateral.token.symbol}`}
                        </Typography>
                      </Flex>
                    </DataText>
                    <DataText>
                      <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
                        <Flex>
                          <Typography fontSize={16}>{`$${collateral.current
                            .minus(collateral.floor)
                            .times(collateral.token.price)
                            .toFormat(0)}`}</Typography>
                          <Typography
                            ml="10px"
                            color={
                              availableRatio.isGreaterThanOrEqualTo(withdrawalsFloorData.percentageFloor.div(2))
                                ? 'primary'
                                : 'alert'
                            }
                          >
                            {`(~${getFormattedNumber(availableRatio.toNumber(), 'percent0')})`}
                          </Typography>
                        </Flex>
                        <Typography color="text1">
                          {`${collateral.current.minus(collateral.floor).toFormat(dp)} ${collateral.token.symbol}`}
                        </Typography>
                      </Flex>
                    </DataText>
                  </DashGrid>

                  {!isLast && <Divider />}
                </Fragment>
              );
            })}
          </>
        ) : (
          <>
            <SkeletonTokenPlaceholder />
            <Divider />
            <SkeletonTokenPlaceholder />
            <Divider />
            <SkeletonTokenPlaceholder />
          </>
        )}
      </MinWidthContainer>
    </Box>
  );
};

export default ExchangeLimits;

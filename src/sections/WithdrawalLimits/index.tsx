import Divider from 'components/Divider';
import { BoxPanel } from 'components/Panel';
import QuestionHelper, { QuestionWrapper } from 'components/QuestionHelper';
import { CurrencyLogoFromURI } from 'components/shared/CurrencyLogo';
import { HIGH_PRICE_ASSET_DP } from 'constants/tokens';
import { useWithdrawalsFloorData } from 'queries';
import React from 'react';
import { Box, Flex } from 'rebass';
import { HeaderText, StyledSkeleton } from 'sections/TokenSection';
import styled from 'styled-components';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

const DashGrid = styled(Box)`
  display: grid;
  gap: 1em;
  align-items: center;
  grid-template-columns: 2fr 6fr 6fr 9fr;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  grid-template-columns: 3fr 6fr 6fr 9fr;
  `}

  > * {
    justify-content: flex-end;
    &:first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }
`;

const DataText = styled(Flex)`
  display: flex;
  font-size: 16px;
  color: #ffffff;
  align-items: center;
  line-height: 1.4;
  min-height: 70px;
`;

const MinWidthContainer = styled(Box)`
  -webkit-overflow-scrolling: touch;
  min-width: 960px !important;
  overflow: hidden;
`;

const SkeletonTokenPlaceholder = () => {
  return (
    <DashGrid my="10px">
      <DataText>
        <Flex alignItems="center">
          <Box sx={{ minWidth: '50px' }}>
            <StyledSkeleton variant="circle" width={40} height={40} />
          </Box>
          <Box ml={2} sx={{ minWidth: '160px' }}>
            <StyledSkeleton width={130} />
            <StyledSkeleton width={70} />
          </Box>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
          <Typography variant="p">
            <StyledSkeleton width={140} />
          </Typography>
          <Typography variant="p">
            <StyledSkeleton width={100} />
          </Typography>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
          <Typography variant="p">
            <StyledSkeleton width={140} />
          </Typography>
          <Typography variant="p">
            <StyledSkeleton width={100} />
          </Typography>
        </Flex>
      </DataText>
      <DataText>
        <Flex alignItems="flex-end" flexDirection="column" minWidth={200} pl={2}>
          <Typography variant="p">
            <StyledSkeleton width={100} />
          </Typography>
          <Typography variant="p">
            <StyledSkeleton width={70} />
          </Typography>
        </Flex>
      </DataText>
    </DashGrid>
  );
};

const WithdrawalLimits = () => {
  const { data: withdrawalsFloorData } = useWithdrawalsFloorData();

  return (
    <BoxPanel bg="bg2">
      <Flex alignItems="center" mb={5}>
        <Typography variant="h2" mr={1}>
          Withdrawal Limits
        </Typography>
        {withdrawalsFloorData && (
          <QuestionWrapper mt="9px">
            <QuestionHelper
              width={290}
              text={`To protect collateral on Balanced, only ${withdrawalsFloorData.percentageFloor
                .times(100)
                .toFixed(
                  0,
                )}% of each asset can be withdrawn during a ${withdrawalsFloorData.floorTimeDecayInHours.toFixed(
                0,
              )} hour period.`}
            />
          </QuestionWrapper>
        )}
      </Flex>
      <Box overflow="auto">
        <MinWidthContainer>
          <DashGrid>
            <HeaderText>Asset</HeaderText>
            <HeaderText>Collateral</HeaderText>
            <HeaderText>Security floor</HeaderText>
            <HeaderText>Available to withdraw</HeaderText>
          </DashGrid>
          {withdrawalsFloorData ? (
            <>
              {withdrawalsFloorData?.collateralFloorData.map((collateral, index) => {
                const isLast = index === withdrawalsFloorData.collateralFloorData.length - 1;
                const dp = HIGH_PRICE_ASSET_DP[collateral.token.address] || 0;
                const availableRatio = collateral.current.minus(collateral.floor).div(collateral.current);

                return (
                  <>
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
                  </>
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
    </BoxPanel>
  );
};

export default WithdrawalLimits;

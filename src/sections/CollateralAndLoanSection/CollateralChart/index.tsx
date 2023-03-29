import React, { useMemo } from 'react';

import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { useCollateralInfo, useLoanInfo, useBorrowersInfo } from 'queries';
import { useTokenPrices } from 'queries/backendv2';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';

import CollateralSelector from 'components/CollateralSelector';
import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import { ONE } from 'constants/number';
import useWidth from 'hooks/useWidth';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { useStabilityFundTotal, useSupportedCollateralTokens } from 'store/collateral/hooks';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

import { ChartPanel } from '..';
import TimeFrameSelector, { CollateralChartTimeFrame } from '../TimeFrameSelector';
import Chart from './Chart';
import StabilityFundChart from './StabilityFundChart';

export default function CollateralChart({
  selectedCollateral,
  selectedTimeFrame,
  setCollateral,
  setSelectedTimeFrame,
}: {
  selectedCollateral: string;
  selectedTimeFrame: CollateralChartTimeFrame;
  setSelectedTimeFrame: (timeFrame) => void;
  setCollateral: (string) => void;
}) {
  const { data: collateralInfo } = useCollateralInfo();
  const loanInfo = useLoanInfo();
  const { data: borrowersInfo } = useBorrowersInfo();
  const { data: supportedCollaterals } = useSupportedCollateralTokens();
  const stabilityFundTotal = useStabilityFundTotal();
  const { data: tokenPrices } = useTokenPrices();

  const [collateralTVLHover, setCollateralTVLHover] = React.useState<number | undefined>();
  const [collateralLabel, setCollateralLabel] = React.useState<string | undefined>();

  const [userHovering, setUserHovering] = React.useState<boolean>(false);

  const [totalCollateral, setTotalCollateral] = React.useState<undefined | number>();
  const [totalStabilityFundBnUSD, setTotalStabilityFundBnUSD] = React.useState<undefined | number>();
  const [collateralChange, setCollateralChange] = React.useState<undefined | number>();

  const collateralTVLInUSDHover = useMemo(
    () =>
      getFormattedNumber(
        new BigNumber(collateralTVLHover || '0')
          .times((tokenPrices && tokenPrices[selectedCollateral]) || ONE)
          .integerValue()
          .toNumber(),
        'currency0',
      ),

    [selectedCollateral, tokenPrices, collateralTVLHover],
  );

  //update chart collateral amount and value if user is not hovering over the chart
  React.useEffect(() => {
    if (!userHovering && collateralInfo) {
      if (selectedCollateral === predefinedCollateralTypes.ALL) {
        setCollateralTVLHover(collateralInfo.collateralData.current.total.value);
      } else if (selectedCollateral === predefinedCollateralTypes.STABILITY_FUND) {
        if (totalStabilityFundBnUSD) {
          setCollateralTVLHover(totalStabilityFundBnUSD);
        }
      } else {
        if (collateralInfo.collateralData.current[selectedCollateral]) {
          setCollateralTVLHover(collateralInfo.collateralData.current[selectedCollateral].amount);
        }
      }
    }
  }, [collateralInfo, selectedCollateral, userHovering, totalStabilityFundBnUSD]);

  const [ref, width] = useWidth();
  const isExtraSmall = useMedia('(max-width: 480px)');

  return (
    <ChartPanel bg="bg2">
      <Flex flexDirection={['column', 'row']} ref={ref}>
        <Flex mr="auto" flexDirection="column" alignItems="center">
          <Flex alignItems="center" mb={1}>
            <Typography variant="h2" mr={2} mb="2px">
              Collateral:
            </Typography>
            <CollateralSelector
              width={width}
              containerRef={ref.current}
              collateral={selectedCollateral === 'sICX' ? 'ICON' : selectedCollateral}
              setCollateral={setCollateral}
            />{' '}
            <TimeFrameSelector selected={selectedTimeFrame} setSelected={setSelectedTimeFrame} />
          </Flex>
        </Flex>
        <Typography variant="h3" mt={1} mb={1}>
          {collateralInfo && collateralTVLHover && `${collateralTVLInUSDHover}`}
        </Typography>
      </Flex>

      <Flex mb={1}>
        <Typography variant="p" color="text2" fontSize={18}>
          {collateralLabel ? <>{collateralLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}
        </Typography>
        {selectedCollateral !== predefinedCollateralTypes.ALL &&
          selectedCollateral !== predefinedCollateralTypes.STABILITY_FUND && (
            <Typography ml="auto" variant="p" color="text2" fontSize={18}>
              {collateralTVLHover &&
                `${getFormattedNumber(
                  collateralTVLHover,
                  collateralTVLHover > 100 ? 'number' : 'number4',
                )} ${selectedCollateral}`}
            </Typography>
          )}
      </Flex>

      {selectedCollateral === predefinedCollateralTypes.STABILITY_FUND ? (
        <StabilityFundChart
          collateralTVLHover={collateralTVLHover}
          collateralLabel={collateralLabel}
          selectedTimeFrame={selectedTimeFrame}
          setCollateralTVLHover={setCollateralTVLHover}
          setCollateralLabel={setCollateralLabel}
          setTotalStabilityFundBnUSD={setTotalStabilityFundBnUSD}
          setUserHovering={setUserHovering}
        ></StabilityFundChart>
      ) : (
        <Chart
          selectedCollateral={selectedCollateral}
          collateralTVLHover={collateralTVLHover}
          collateralLabel={collateralLabel}
          selectedTimeFrame={selectedTimeFrame}
          setCollateralTVLHover={setCollateralTVLHover}
          setCollateralLabel={setCollateralLabel}
          setUserHovering={setUserHovering}
          setCollateralChange={setCollateralChange}
          setTotalCollateral={setTotalCollateral}
        ></Chart>
      )}

      {/* Flexible chart footer */}
      <Flex my={3} mx={-4} flexWrap="wrap">
        {selectedCollateral === 'All' ? (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize="18px">
                {supportedCollaterals ? Object.keys(supportedCollaterals).length + 1 : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Collateral types</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center" className={isExtraSmall ? '' : 'border-right'}>
              <Typography variant="p" fontSize="18px">
                {totalCollateral && loanInfo.totalBnUSD ? (
                  getFormattedNumber(totalCollateral / loanInfo.totalBnUSD, 'percent0')
                ) : (
                  <LoaderComponent />
                )}
              </Typography>
              <Typography opacity={0.75}>Collateral ratio</Typography>
            </Flex>
            <Flex
              flex={isExtraSmall ? null : 1}
              mt={isExtraSmall ? '20px' : 0}
              flexDirection="column"
              alignItems="center"
              width={isExtraSmall ? '100%' : 'auto'}
            >
              {collateralChange === undefined ? (
                <LoaderComponent></LoaderComponent>
              ) : collateralChange >= 0 ? (
                <Typography fontSize={18} color="text">{`+ ${getFormattedNumber(
                  collateralChange,
                  'percent2',
                )}`}</Typography>
              ) : (
                <Typography fontSize={18} color="text">
                  {getFormattedNumber(collateralChange, 'percent2').replace('-', '- ')}
                </Typography>
              )}
              <Typography opacity={0.75}>Last week</Typography>
            </Flex>
          </>
        ) : selectedCollateral === 'Stability Fund' ? (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize="18px">
                {stabilityFundTotal ? stabilityFundTotal.tokenCount : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Stable coins</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center">
              <Typography variant="p" fontSize="18px">
                {stabilityFundTotal ? `$${stabilityFundTotal.maxLimit?.toFormat(0)}` : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Maximum limit</Typography>
            </Flex>
          </>
        ) : selectedCollateral === 'sICX' ? (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize="18px">
                {collateralInfo?.stakingAPY ? (
                  getFormattedNumber(collateralInfo?.stakingAPY, 'percent2')
                ) : (
                  <LoaderComponent />
                )}
              </Typography>
              <Typography opacity={0.75}>Staking APY</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center" className={isExtraSmall ? '' : 'border-right'}>
              <Typography variant="p" fontSize="18px">
                {collateralInfo?.rate ? getFormattedNumber(collateralInfo.rate, 'number4') : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>sICX / ICX price</Typography>
            </Flex>
            <Flex
              flex={isExtraSmall ? null : 1}
              mt={isExtraSmall ? '20px' : 0}
              flexDirection="column"
              alignItems="center"
              width={isExtraSmall ? '100%' : 'auto'}
            >
              <Typography variant="p" fontSize="18px">
                {borrowersInfo ? getFormattedNumber(borrowersInfo['sICX'], 'number') : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Suppliers</Typography>
            </Flex>
          </>
        ) : (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize="18px">
                {tokenPrices && tokenPrices[selectedCollateral] ? (
                  `$${tokenPrices[selectedCollateral].toFormat(2)}`
                ) : (
                  <LoaderComponent />
                )}
              </Typography>
              <Typography opacity={0.75}>{selectedCollateral} price</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center">
              <Typography variant="p" fontSize="18px">
                {borrowersInfo && borrowersInfo[selectedCollateral] ? (
                  getFormattedNumber(borrowersInfo[selectedCollateral], 'number')
                ) : (
                  <LoaderComponent />
                )}
              </Typography>
              <Typography opacity={0.75}>Suppliers</Typography>
            </Flex>
          </>
        )}
      </Flex>
    </ChartPanel>
  );
}

import React, { useMemo } from 'react';

import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { useCollateralInfo, useLoanInfo } from 'queries';
import { Flex } from 'rebass';

import CollateralSelector from 'components/CollateralSelector';
import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import { ONE } from 'constants/number';
import useWidth from 'hooks/useWidth';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { useStabilityFundTotal, useSupportedCollateralTokens, useTotalCollateral } from 'store/collateral/hooks';
import { useOraclePrices } from 'store/oracle/hooks';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

import { ChartPanel } from '..';
import Chart from './Chart';

export default function CollateralChart({
  selectedCollateral,
  setCollateral,
}: {
  selectedCollateral: string;
  setCollateral: (string) => void;
}) {
  const { data: collateralInfo } = useCollateralInfo();
  const loanInfo = useLoanInfo();
  const { data: supportedCollaterals } = useSupportedCollateralTokens();
  const totalCollateral = useTotalCollateral();
  const stabilityFundTotal = useStabilityFundTotal();
  const oraclePrices = useOraclePrices();

  const [collateralTVLHover, setCollateralTVLHover] = React.useState<number | undefined>();
  const [collateralLabel, setCollateralLabel] = React.useState<string | undefined>();

  const [userHovering, setUserHovering] = React.useState<boolean>(false);

  const collateralTVLInUSDHover = useMemo(
    () =>
      getFormattedNumber(
        new BigNumber(collateralTVLHover || '0')
          .times(oraclePrices[selectedCollateral] || ONE)
          .integerValue()
          .toNumber(),
        'currency0',
      ),

    [selectedCollateral, oraclePrices, collateralTVLHover],
  );

  //update chart collateral amount and value if user is not hovering over the chart
  React.useEffect(() => {
    if (!userHovering && collateralInfo) {
      if (selectedCollateral === predefinedCollateralTypes.ALL && collateralInfo.totalTVL) {
        setCollateralTVLHover(collateralInfo.totalTVL);
      } else if (selectedCollateral === predefinedCollateralTypes.STABILITY_FUND) {
        if (collateralInfo.stabilityFundTotal) {
          setCollateralTVLHover(collateralInfo.stabilityFundTotal);
        }
      } else {
        if (collateralInfo.totalCollaterals[selectedCollateral]) {
          setCollateralTVLHover(collateralInfo.totalCollaterals[selectedCollateral].amount);
        }
      }
    }
  }, [collateralInfo, selectedCollateral, userHovering]);

  const [ref, width] = useWidth();

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
            />
          </Flex>
        </Flex>
        <Typography variant="h3" mt={1} mb={1}>
          {collateralInfo && `${collateralTVLInUSDHover}`}
        </Typography>
      </Flex>

      <Flex>
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

      <Chart
        selectedCollateral={selectedCollateral}
        collateralTVLHover={collateralTVLHover}
        collateralLabel={collateralLabel}
        setCollateralTVLHover={setCollateralTVLHover}
        setCollateralLabel={setCollateralLabel}
        setUserHovering={setUserHovering}
      ></Chart>

      {/* Flexible chart footer */}
      <Flex my={3}>
        {selectedCollateral === 'All' ? (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize="18px">
                {supportedCollaterals ? Object.keys(supportedCollaterals).length : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Collateral types</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize="18px">
                {totalCollateral && loanInfo.totalBnUSD ? (
                  getFormattedNumber(totalCollateral.dividedBy(loanInfo.totalBnUSD).toNumber(), 'percent0')
                ) : (
                  <LoaderComponent />
                )}
              </Typography>
              <Typography opacity={0.75}>Collateral ratio</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center">
              <Typography variant="p" fontSize="18px">
                +12%**
              </Typography>
              <Typography opacity={0.75}>Last 7 days</Typography>
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
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize="18px">
                {collateralInfo?.rate ? getFormattedNumber(collateralInfo.rate, 'number4') : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>sICX / ICX price</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center">
              <Typography variant="p" fontSize="18px">
                count**
              </Typography>
              <Typography opacity={0.75}>Suppliers</Typography>
            </Flex>
          </>
        ) : (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize="18px">
                {oraclePrices && oraclePrices[selectedCollateral] ? (
                  `$${oraclePrices[selectedCollateral].toFormat(2)}`
                ) : (
                  <LoaderComponent />
                )}
              </Typography>
              <Typography opacity={0.75}>{selectedCollateral} price</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center">
              <Typography variant="p" fontSize="18px">
                count**
              </Typography>
              <Typography opacity={0.75}>Suppliers</Typography>
            </Flex>
          </>
        )}
      </Flex>
    </ChartPanel>
  );
}

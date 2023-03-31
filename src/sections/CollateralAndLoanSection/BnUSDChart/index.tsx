import React from 'react';

import dayjs from 'dayjs';
import { useBorrowersInfo, useFundInfo, useLoanInfo } from 'queries';
import { useMedia } from 'react-use';
import { Flex } from 'rebass';

import { predefinedCollateralTypes } from 'components/CollateralSelector/CollateralTypeList';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { MAX_BOOST } from 'sections/PairSection';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

import { ChartPanel } from '..';
import { CollateralChartTimeFrame } from '../TimeFrameSelector';
import Chart from './Chart';

export default function BnUSDChart({
  selectedCollateral,
  selectedTimeFrame,
}: {
  selectedCollateral: string;
  selectedTimeFrame: CollateralChartTimeFrame;
}) {
  const loanInfo = useLoanInfo();
  const { data: borrowersInfo } = useBorrowersInfo();
  const { data: fundInfo } = useFundInfo();

  const [userHovering, setUserHovering] = React.useState<boolean>(false);

  const [bnUSDHover, setBnUSDHover] = React.useState<number | undefined>();
  const [bnUSDLabel, setBnUSDLabel] = React.useState<string | undefined>();

  const [totalBnUSD, setTotalBnUSD] = React.useState<undefined | number>();

  const cbSetUserHovering = React.useCallback(bool => {
    setUserHovering(bool);
  }, []);

  const cbSetBnUSDHover = React.useCallback((value: number | undefined) => {
    setBnUSDHover(value);
  }, []);

  const cbSetBnUSDLabel = React.useCallback((value: string | undefined) => {
    setBnUSDLabel(value);
  }, []);

  const cbSetTotalBnUSD = React.useCallback((value: number | undefined) => {
    setTotalBnUSD(value);
  }, []);

  React.useEffect(() => {
    if (!userHovering) {
      setBnUSDHover(totalBnUSD);
    }
  }, [bnUSDHover, totalBnUSD, userHovering]);

  const isExtraSmall = useMedia('(max-width: 600px)');

  return (
    <ChartPanel bg="bg2">
      <Flex flexDirection={['column', 'row']}>
        <Flex mr="auto" mb={1} alignItems="center">
          <Typography variant="h2" mr="auto" mb={1}>
            Balanced Dollars
          </Typography>
        </Flex>
        <Typography variant="h3" mb={1} mt={1}>
          {bnUSDHover ? getFormattedNumber(bnUSDHover || 0, 'number') : <LoaderComponent />} bnUSD
        </Typography>
        <Flex flexDirection="column" alignItems={['start', 'end']} mb={1}></Flex>
      </Flex>

      <Typography variant="p" color="text2" mr="auto" fontSize={18}>
        {bnUSDLabel ? <>{bnUSDLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}
      </Typography>

      <Chart
        collateralTVLHover={bnUSDHover}
        collateralLabel={bnUSDLabel}
        selectedCollateral={selectedCollateral}
        selectedTimeFrame={selectedTimeFrame}
        setCollateralTVLHover={cbSetBnUSDHover}
        setCollateralLabel={cbSetBnUSDLabel}
        setTotalBnUSD={cbSetTotalBnUSD}
        setUserHovering={cbSetUserHovering}
      ></Chart>

      {/* flexible footer */}
      <Flex my={3} mx={-4} flexWrap="wrap">
        {/* {selectedCollateral === predefinedCollateralTypes.STABILITY_FUND ? (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize={[16, '18px']}>
                {fundInfo ? `${fundInfo.feeIn}%` : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Stability Fund fee</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center">
              <Typography variant="p" fontSize={[16, '18px']}>
                {fundInfo ? getFormattedNumber(fundInfo.feesGenerated, 'price') : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Earned past month</Typography>
            </Flex>
          </>
        ) : selectedCollateral === predefinedCollateralTypes.ALL ? (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize={[16, '18px']}>
                {loanInfo.loansAPY ? (
                  `${getFormattedNumber(loanInfo.loansAPY, 'percent2')} - ${getFormattedNumber(
                    loanInfo.loansAPY * MAX_BOOST,
                    'percent2',
                  )}`
                ) : (
                  <LoaderComponent />
                )}
              </Typography>
              <Typography opacity={0.75}>Borrow APY</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center" className={isExtraSmall ? '' : 'border-right'}>
              <Typography variant="p" fontSize={[16, '18px']}>
                {loanInfo.dailyRewards ? getFormattedNumber(loanInfo.dailyRewards, 'number') : <LoaderComponent />} BALN
              </Typography>
              <Typography opacity={0.75}>Daily rewards</Typography>
            </Flex>
            <Flex
              flex={isExtraSmall ? null : 1}
              mt={isExtraSmall ? '20px' : 0}
              flexDirection="column"
              alignItems="center"
              width={isExtraSmall ? '100%' : 'auto'}
            >
              <Typography variant="p" fontSize={[16, '18px']}>
                {borrowersInfo ? getFormattedNumber(borrowersInfo.total, 'number') : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Borrowers</Typography>
            </Flex>
          </>
        ) : (
          <>
            <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
              <Typography variant="p" fontSize={[16, '18px']}>
                {loanInfo.loansAPY ? getFormattedNumber(loanInfo.loansAPY, 'percent2') : <LoaderComponent />}
              </Typography>
              <Typography opacity={0.75}>Borrow APY</Typography>
            </Flex>
            <Flex flex={1} flexDirection="column" alignItems="center">
              <Typography variant="p" fontSize={[16, '18px']}>
                {loanInfo.dailyRewards ? getFormattedNumber(loanInfo.dailyRewards, 'number') : <LoaderComponent />} BALN
              </Typography>
              <Typography opacity={0.75}>Daily rewards</Typography>
            </Flex>
          </>
        )} */}
        <>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.loansAPY ? (
                `${getFormattedNumber(loanInfo.loansAPY, 'percent2')} - ${getFormattedNumber(
                  loanInfo.loansAPY * MAX_BOOST,
                  'percent2',
                )}`
              ) : (
                <LoaderComponent />
              )}
            </Typography>
            <Typography opacity={0.75}>Borrow APY</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center" className={isExtraSmall ? '' : 'border-right'}>
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.dailyRewards ? getFormattedNumber(loanInfo.dailyRewards, 'number') : <LoaderComponent />} BALN
            </Typography>
            <Typography opacity={0.75}>Daily rewards</Typography>
          </Flex>
          <Flex
            flex={isExtraSmall ? null : 1}
            mt={isExtraSmall ? '20px' : 0}
            flexDirection="column"
            alignItems="center"
            width={isExtraSmall ? '100%' : 'auto'}
          >
            <Typography variant="p" fontSize={[16, '18px']}>
              {borrowersInfo ? getFormattedNumber(borrowersInfo.total, 'number') : <LoaderComponent />}
            </Typography>
            <Typography opacity={0.75}>Borrowers</Typography>
          </Flex>
        </>
      </Flex>
    </ChartPanel>
  );
}

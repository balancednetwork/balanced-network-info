import React, { useCallback, useState } from 'react';

import { addresses } from '@balancednetwork/balanced-js';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { useContractMethodsDataQuery } from 'queries/backendv2';
import useHistoryFor from 'queries/historicalData';
import { getBitcoinCollateralParams } from 'queries/historicalData/predefinedOptions';
import { useCollateralInfo, useLoanInfo, useRatesQuery } from 'queries/index';
import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import CollateralSelector from 'components/CollateralSelector';
import LineChart, { DEFAULT_HEIGHT } from 'components/LineChart';
import { BoxPanel } from 'components/Panel';
import Spinner from 'components/Spinner';
import { ONE } from 'constants/number';
import useTheme from 'hooks/useTheme';
import useWidth from 'hooks/useWidth';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { useStabilityFundTotal, useSupportedCollateralTokens, useTotalCollateral } from 'store/collateral/hooks';
import { useOraclePrices } from 'store/oracle/hooks';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

const ChartSection = styled(Box)`
  box-sizing: border-box;
  margin: 0px;
  min-width: 0px;
  width: 100%;
  display: flex;
  padding: 0px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  column-gap: 50px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    row-gap: 50px;
  `}
`;

const ChartPanel = styled(BoxPanel)`
  width: 100%;
`;

const ChartContainer = styled(Box)`
  position: relative;
  height: ${DEFAULT_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function CollateralAndLoanSection() {
  const collateralInfo = useCollateralInfo();
  const loanInfo = useLoanInfo();
  const ratesQuery = useRatesQuery();
  const rates = ratesQuery.data || {};
  const theme = useTheme();
  const { data: allCollateralChartData } = useContractMethodsDataQuery(addresses[1].loans, 'getTotalCollateral');
  const { data: loansChartData } = useContractMethodsDataQuery(addresses[1].bnusd, 'totalSupply');
  const { data: supportedCollaterals } = useSupportedCollateralTokens();
  const totalCollateral = useTotalCollateral();
  const stabilityFundTotal = useStabilityFundTotal();
  const oraclePrices = useOraclePrices();

  const [loanTVLHover, setLoansTVLHover] = React.useState<number | undefined>();
  const [loanLabel, setLoanLabel] = React.useState<string | undefined>();
  React.useEffect(() => {
    if (!loanTVLHover && loanInfo) {
      setLoansTVLHover(loanInfo.totalBnUSD);
    }
  }, [loanTVLHover, loanInfo]);

  const [collateralTVLHover, setCollateralTVLHover] = React.useState<number | undefined>();
  const [collateralLabel, setCollateralLabel] = React.useState<string | undefined>();
  const collateralTVLInUSDHover = getFormattedNumber(
    new BigNumber(collateralTVLHover || '0')
      .times(rates['sICX'] || ONE)
      .integerValue()
      .toNumber(),
    'currency0',
  );
  React.useEffect(() => {
    if (!collateralTVLHover && collateralInfo) {
      setCollateralTVLHover(collateralInfo.totalCollateral);
    }
  }, [collateralTVLHover, collateralInfo]);

  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: historyFor } = useHistoryFor(getBitcoinCollateralParams(now, 'week', 10));
  const [ref, width] = useWidth();

  const [selectedCollateral, setSelectedCollateral] = useState<string>('All');
  const setCollateral = useCallback(collateral => setSelectedCollateral(collateral), [setSelectedCollateral]);

  return (
    <ChartSection>
      {/* <ChartPanel bg="bg2">
        <Typography variant="h2" mb={1}>
          New Collateral
        </Typography>
        <ChartContainer>
          {historyFor ? (
            <LineChart
              data={historyFor}
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
      </ChartPanel> */}

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
                collateral={selectedCollateral}
                setCollateral={setCollateral}
              />
            </Flex>
          </Flex>
          <Typography variant="h3" mt={1} mb={1}>
            {collateralInfo.totalCollateral && `${collateralTVLInUSDHover}`}
          </Typography>
        </Flex>

        {/* <Typography variant="h3" mb={1}>
          {collateralInfo.totalCollateral ? getFormattedNumber(collateralTVLHover || 0, 'number') : <LoaderComponent />}{' '}
          sICX{' '}
          {collateralInfo.totalCollateral && (
            <Typography variant="p" as="span" color="text1">
              {`(${collateralTVLInUSDHover})`}
            </Typography>
          )}
        </Typography> */}
        <Typography variant="p" color="text2" fontSize={18}>
          {collateralLabel ? <>{collateralLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}
        </Typography>
        <ChartContainer>
          {allCollateralChartData ? (
            <LineChart
              data={allCollateralChartData}
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
          ) : selectedCollateral === 'ICON' ? (
            <>
              <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
                <Typography variant="p" fontSize="18px">
                  {collateralInfo.stakingAPY ? (
                    getFormattedNumber(collateralInfo.stakingAPY, 'percent2')
                  ) : (
                    <LoaderComponent />
                  )}
                </Typography>
                <Typography opacity={0.75}>Staking APY</Typography>
              </Flex>
              <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
                <Typography variant="p" fontSize="18px">
                  {collateralInfo.rate ? getFormattedNumber(collateralInfo.rate, 'number4') : <LoaderComponent />}
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
                  {oraclePrices ? `$${oraclePrices[selectedCollateral].toFormat(2)}` : <LoaderComponent />}
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

      <ChartPanel bg="bg2">
        <Flex flexDirection={['column', 'row']}>
          <Flex mr="auto" flexDirection="column" mb={1}>
            <Typography variant="h2" mr="auto" mb={1}>
              Balanced Dollars
            </Typography>
            <Typography variant="p" color="text2" mr="auto" fontSize={18}>
              {loanLabel ? <>{loanLabel}</> : <>{dayjs.utc().format('MMM D, YYYY')}</>}
            </Typography>
          </Flex>
          <Flex flexDirection="column" alignItems={['start', 'end']} mb={1}>
            <Typography variant="h3" mb={1}>
              {loanInfo.totalBnUSD ? getFormattedNumber(loanTVLHover || 0, 'number') : <LoaderComponent />} bnUSD
            </Typography>
            <Typography color="text2" fontSize={18}>
              {rates && rates['bnUSD'] && loanInfo.totalBnUSD ? (
                `$${rates['bnUSD'].times(loanTVLHover || 1).toFormat(0)}`
              ) : (
                <LoaderComponent />
              )}
            </Typography>
          </Flex>
        </Flex>
        <ChartContainer>
          {loansChartData ? (
            <LineChart
              data={loansChartData}
              height={DEFAULT_HEIGHT}
              minHeight={DEFAULT_HEIGHT}
              color={theme.colors.primary}
              value={loanTVLHover}
              label={loanLabel}
              setValue={setLoansTVLHover}
              setLabel={setLoanLabel}
            />
          ) : (
            <Spinner size={75} />
          )}
        </ChartContainer>
        <Flex my={3} mx={-4}>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.loansAPY ? getFormattedNumber(loanInfo.loansAPY, 'percent2') : <LoaderComponent />}
            </Typography>
            <Typography opacity={0.75}>Borrow APY</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center" className="border-right">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.dailyRewards ? getFormattedNumber(loanInfo.dailyRewards, 'number') : <LoaderComponent />} BALN
            </Typography>
            <Typography opacity={0.75}>Daily rewards</Typography>
          </Flex>
          <Flex flex={1} flexDirection="column" alignItems="center">
            <Typography variant="p" fontSize={[16, '18px']}>
              {loanInfo.borrowers ? getFormattedNumber(loanInfo.borrowers, 'number') : <LoaderComponent />}
            </Typography>
            <Typography opacity={0.75}>Borrowers</Typography>
          </Flex>
        </Flex>
      </ChartPanel>
    </ChartSection>
  );
}

import React, { useState } from 'react';

import BigNumber from 'bignumber.js';
import { LAUNCH_DAY } from 'queries';
import { usePOLData } from 'queries/blockDetails';
import DatePicker from 'react-datepicker';
import { Box, Flex, Text } from 'rebass/styled-components';

import { BoxPanel } from 'components/Panel';
import PoolLogo from 'components/shared/PoolLogo';
import { DatePickerWrap, DisplayValueOrLoader, formatPercentage } from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';

import { GridItemToken, GridItemAssetTotal, GridItemHeader, ScrollHelper } from '../../index';
import { StyledSkeleton } from '../EarningSection';
import 'react-datepicker/dist/react-datepicker.css';
import { BalanceGrid, Change, DatePickerInput } from '../HoldingsSection';

const POLSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 1)));

  let totalCurrent = 0;
  let totalPast = 0;

  const oneMinPeriod = 1000 * 60;
  const now = Math.floor(new Date().getTime() / oneMinPeriod) * oneMinPeriod;

  const { data: POLCurrent } = usePOLData(now);
  const { data: POLPast } = usePOLData(selectedDate.valueOf());

  return (
    <BoxPanel bg="bg2" mb={10}>
      <Typography variant="h2">Protocol owned liquidity</Typography>
      <ScrollHelper>
        <BalanceGrid>
          <GridItemHeader>Pool</GridItemHeader>
          <GridItemHeader>
            {new Date().toLocaleDateString('en-US', {
              day: '2-digit',
            })}{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </GridItemHeader>
          <GridItemHeader>
            <DatePickerWrap>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="dd MMM yyyy"
                popperClassName="datepicker-popper-wrap"
                popperPlacement="bottom-end"
                minDate={new Date(LAUNCH_DAY / 1000)}
                maxDate={new Date().setDate(new Date().getDate() - 1)}
                customInput={<DatePickerInput />}
                popperModifiers={[
                  { name: 'offset', options: { offset: [20, -3] } },
                  {
                    name: 'preventOverflow',
                    options: {
                      rootBoundary: 'body',
                      tether: false,
                      altAxis: true,
                    },
                  },
                ]}
              />
            </DatePickerWrap>
          </GridItemHeader>
        </BalanceGrid>

        {POLCurrent &&
          POLCurrent.map(currentPool => {
            const poolPast = POLPast?.find(pool => pool.id === currentPool.id);
            const percentageChange =
              poolPast && currentPool.liquidity.isGreaterThan(poolPast.liquidity)
                ? new BigNumber(100).minus(poolPast.liquidity.times(100).div(currentPool.liquidity)).toNumber()
                : poolPast && poolPast.liquidity.isGreaterThan(0)
                ? currentPool.liquidity.div(poolPast.liquidity).minus(1).times(100).toNumber()
                : 0;

            totalCurrent += currentPool.liquidity.toNumber();
            if (poolPast) {
              totalPast += poolPast.liquidity.toNumber();
            }

            return (
              currentPool.liquidity.isGreaterThan(0) && (
                <BalanceGrid key={currentPool.id}>
                  <GridItemToken>
                    {currentPool.pair && (
                      <Flex alignItems="center">
                        <Box sx={{ minWidth: '95px' }}>
                          <PoolLogo
                            baseCurrency={currentPool.pair.baseToken}
                            quoteCurrency={currentPool.pair.quoteToken}
                          />
                        </Box>
                        <Text
                          ml={2}
                        >{`${currentPool.pair.baseCurrencyKey} / ${currentPool.pair.quoteCurrencyKey}`}</Text>
                      </Flex>
                    )}
                  </GridItemToken>
                  <GridItemToken>
                    <Text color="text" mt={'13px'}>
                      <DisplayValueOrLoader value={currentPool.liquidity} currencyRate={1} />
                      <Change percentage={percentageChange ?? 0}>{formatPercentage(percentageChange)}</Change>
                    </Text>
                  </GridItemToken>
                  <GridItemToken>
                    <Text color="text" mt={'13px'}>
                      {POLPast && poolPast ? (
                        poolPast.liquidity.isGreaterThan(0) ? (
                          <DisplayValueOrLoader value={poolPast.liquidity} currencyRate={1} />
                        ) : (
                          '-'
                        )
                      ) : (
                        <StyledSkeleton width={120} />
                      )}
                    </Text>
                  </GridItemToken>
                </BalanceGrid>
              )
            );
          })}

        <BalanceGrid>
          <GridItemAssetTotal>Total</GridItemAssetTotal>
          <GridItemAssetTotal>
            {POLCurrent ? (
              <DisplayValueOrLoader value={totalCurrent} currencyRate={1} />
            ) : (
              <StyledSkeleton width={120} />
            )}
          </GridItemAssetTotal>
          <GridItemAssetTotal>
            {POLPast ? <DisplayValueOrLoader value={totalPast} currencyRate={1} /> : <StyledSkeleton width={120} />}
          </GridItemAssetTotal>
        </BalanceGrid>
      </ScrollHelper>
    </BoxPanel>
  );
};

export default POLSection;

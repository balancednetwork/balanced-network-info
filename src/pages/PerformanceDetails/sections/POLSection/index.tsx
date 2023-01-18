import React, { useState } from 'react';

import BigNumber from 'bignumber.js';
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

  const gridWidth = 850;

  return (
    <BoxPanel bg="bg2" mb={10}>
      <Typography variant="h2">Protocol owned liquidity</Typography>
      <ScrollHelper>
        <BalanceGrid minWidth={gridWidth}>
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
                minDate={new Date(2023, 0, 2)}
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
                <BalanceGrid minWidth={gridWidth} key={currentPool.id}>
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
                    <Text color="text">
                      <DisplayValueOrLoader value={currentPool.liquidity} currencyRate={1} />
                      <Change percentage={percentageChange ?? 0}>{formatPercentage(percentageChange)}</Change>
                    </Text>
                    <Text color="text2">{`${currentPool.DAOBaseAmount.toFormat(0)} ${
                      currentPool.pair?.baseCurrencyKey
                    } / ${currentPool.DAOQuoteAmount.toFormat(0)} ${currentPool.pair?.quoteCurrencyKey}`}</Text>
                  </GridItemToken>
                  <GridItemToken>
                    {POLPast && poolPast ? (
                      poolPast.liquidity.isGreaterThan(0) ? (
                        <>
                          <Text color="text">
                            <DisplayValueOrLoader value={poolPast.liquidity} currencyRate={1} />
                          </Text>
                          <Text color="text2">{`${poolPast.DAOBaseAmount.toFormat(0)} ${
                            poolPast.pair?.baseCurrencyKey
                          } / ${poolPast.DAOQuoteAmount.toFormat(0)} ${poolPast.pair?.quoteCurrencyKey}`}</Text>
                        </>
                      ) : (
                        '-'
                      )
                    ) : (
                      <StyledSkeleton width={120} />
                    )}
                  </GridItemToken>
                </BalanceGrid>
              )
            );
          })}

        <BalanceGrid minWidth={gridWidth}>
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

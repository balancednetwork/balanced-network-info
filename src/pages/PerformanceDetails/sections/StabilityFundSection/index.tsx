import React, { useState } from 'react';

import { useHoldingsDataQuery, useRatesQuery, useWhitelistedTokensList, LAUNCH_DAY, ONE_DAY } from 'queries';
import { useBlockDetails } from 'queries/blockDetails';
import DatePicker from 'react-datepicker';
import { Box, Flex, Text } from 'rebass/styled-components';

import CurrencyIcon from 'components/CurrencyIcon';
import { BoxPanel } from 'components/Panel';
import { DatePickerWrap, DisplayValueOrLoader, formatPercantage } from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';

import { GridItemToken, GridItemAssetTotal, GridItemHeader, ScrollHelper } from '../../index';
import { StyledSkeleton } from '../EarningSection';
import { BalanceGrid, Change, DatepickerInput } from '../HoldingsSection';

import 'react-datepicker/dist/react-datepicker.css';

const whitelistedTokens = ['IUSDC', 'USDS'];

const StabilityFundSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 1)));

  const wlTokens = useWhitelistedTokensList();
  console.log(wlTokens);

  const holdingsDataQueryCurrent = useHoldingsDataQuery();
  const holdingsDataQueryPast = useHoldingsDataQuery(
    selectedDate.valueOf() * 1000,
    `holdings-data-${selectedDate.valueOf()}`,
  );
  const { data: holdingsCurrent } = holdingsDataQueryCurrent;
  const { data: holdingsPast } = holdingsDataQueryPast;

  const ratesQuery = useRatesQuery();
  const { data: rates } = ratesQuery;

  let totalCurrent = 0;
  let totalPast = 0;

  const now = new Date();
  const { data: blockDetails } = useBlockDetails(now.getTime() - 100000);

  console.log('ss');
  console.log(selectedDate.valueOf());

  console.log(blockDetails?.number);

  return (
    <BoxPanel bg="bg2" mb={10}>
      <Typography variant="h2">Stability fund</Typography>
      <ScrollHelper>
        <BalanceGrid>
          <GridItemHeader>Asset</GridItemHeader>
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
                minDate={new Date((LAUNCH_DAY + ONE_DAY * 381) / 1000)}
                maxDate={new Date().setDate(new Date().getDate() - 1)}
                customInput={<DatepickerInput />}
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

        {holdingsCurrent &&
          Object.keys(holdingsCurrent)
            .filter(contract => whitelistedTokens.indexOf(holdingsCurrent[contract].info.symbol) >= 0)
            .map(contract => {
              const contractInfo = holdingsCurrent[contract].info;
              const contractTokensCount = holdingsCurrent[contract].tokens.integerValue().toNumber();
              const contractTokensCountPast = holdingsPast && holdingsPast[contract]?.tokens.integerValue().toNumber();
              const percentageChange = 100 - (contractTokensCountPast * 100) / contractTokensCount;

              if (rates && contractTokensCount) {
                totalCurrent += contractTokensCount * rates[contractInfo.symbol].toNumber();
              }
              if (rates && contractTokensCountPast) {
                totalPast += contractTokensCountPast * rates[contractInfo.symbol].toNumber();
              }

              return (
                contractTokensCount > 0 && (
                  <BalanceGrid key={contract}>
                    <GridItemToken>
                      <Flex alignItems="center">
                        <CurrencyIcon currencyKey={contractInfo.symbol} width={40} height={40} />
                        <Box ml={2}>
                          <Text color="text">{contractInfo.displayName}</Text>
                          <Text color="text" opacity={0.75}>
                            {contractInfo.symbol}
                          </Text>
                        </Box>
                      </Flex>
                    </GridItemToken>
                    <GridItemToken>
                      <Text color="text">
                        <DisplayValueOrLoader
                          value={contractTokensCount}
                          currencyRate={rates && rates[contractInfo.symbol].toNumber()}
                        />
                        <Change percentage={percentageChange}>{formatPercantage(percentageChange)}</Change>
                      </Text>
                      <Text color="text" opacity={0.75}>
                        <DisplayValueOrLoader value={contractTokensCount} currencyRate={1} format={'number'} />
                        {` ${contractInfo.symbol}`}
                      </Text>
                    </GridItemToken>
                    <GridItemToken>
                      <Text color="text">
                        {holdingsPast ? (
                          holdingsPast[contract] ? (
                            <DisplayValueOrLoader
                              value={contractTokensCountPast}
                              currencyRate={rates && rates[contractInfo.symbol].toNumber()}
                            />
                          ) : (
                            '-'
                          )
                        ) : (
                          <StyledSkeleton width={120} />
                        )}
                      </Text>
                      <Text color="text" opacity={0.75}>
                        {holdingsPast ? (
                          holdingsPast[contract] ? (
                            <>
                              <DisplayValueOrLoader
                                value={contractTokensCountPast}
                                currencyRate={1}
                                format={'number'}
                              />
                              {` ${contractInfo.symbol}`}
                            </>
                          ) : null
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
            <DisplayValueOrLoader value={totalCurrent === 0 ? undefined : totalCurrent} currencyRate={1} />
          </GridItemAssetTotal>
          <GridItemAssetTotal>
            <DisplayValueOrLoader value={totalPast === 0 ? undefined : totalPast} currencyRate={1} />
          </GridItemAssetTotal>
        </BalanceGrid>
      </ScrollHelper>
    </BoxPanel>
  );
};

export default StabilityFundSection;

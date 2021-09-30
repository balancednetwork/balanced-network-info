import React, { useState, useRef } from 'react';

import Skeleton from '@material-ui/lab/Skeleton';
import { useEarningsDataQuery, useRatesQuery } from 'queries';
import ClickAwayListener from 'react-click-away-listener';
import { Flex, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import { UnderlineTextWithArrow } from 'components/DropdownText';
import { MenuList, MenuItem } from 'components/Menu';
import { BoxPanel } from 'components/Panel';
import { DropdownPopper } from 'components/Popover';
import {
  TimePeriod,
  earningPeriods,
  getTimestampFrom,
  displayValueOrLoader,
  dateOptionShort,
  dateOptionLong,
  FormattedPeriods,
  SkeletonPlaceholder,
  LoaderComponent,
} from 'pages/PerformanceDetails/utils';
import { Typography } from 'theme';

import {
  GridItemHeader,
  ScrollHelper,
  GridItemTotal,
  GridItemStrong,
  GridItemLight,
  GridItemSubtotal,
} from '../../index';

export const IncomeGrid = styled.div`
  display: grid;
  grid-template-columns: 4fr 3fr 3fr;
  align-items: stretch;
  min-width: 700px;
`;

export const StyledSkeleton = styled(Skeleton)`
  background-color: rgba(44, 169, 183, 0.2) !important;
  height: 32px;
  margin-left: auto;
`;

const EarningsSection = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(earningPeriods.day);

  const arrowRef = useRef(null);

  const ratesQuery = useRatesQuery();
  const { data: rates } = ratesQuery;

  const formattedDates: FormattedPeriods = {
    current: {
      dateStart: new Date(new Date().setDate(new Date().getDate() - timePeriod.days))
        .toLocaleDateString('en-US', dateOptionShort)
        .replace(',', ''),
      dateEnd: new Date().toLocaleDateString('en-US', dateOptionLong).replace(',', ''),
    },
    past: {
      dateStart: new Date(new Date().setDate(new Date().getDate() - timePeriod.days * 2 - 1))
        .toLocaleDateString('en-US', dateOptionShort)
        .replace(',', ''),
      dateEnd: new Date(new Date().setDate(new Date().getDate() - timePeriod.days - 1))
        .toLocaleDateString('en-US', dateOptionLong)
        .replace(',', ''),
    },
  };

  const earningsDataQueryCurrentPeriod = useEarningsDataQuery(
    getTimestampFrom(timePeriod.days),
    getTimestampFrom(0),
    `earnings-current-period-${timePeriod.days}`,
  );
  const earningsDataQueryPastPeriod = useEarningsDataQuery(
    getTimestampFrom(timePeriod.days * 2),
    getTimestampFrom(timePeriod.days),
    `earnings-past-period-${timePeriod.days}`,
  );
  const { data: earningsCurrentPeriod } = earningsDataQueryCurrentPeriod;
  const { data: earningsPastPeriod } = earningsDataQueryPastPeriod;

  const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : arrowRef.current);
  };

  const closeDropdown = () => {
    setAnchor(null);
  };

  const handlePeriodChange = period => {
    setTimePeriod(earningPeriods[period]);
  };

  let swapFeesTotalCurrent = 0;
  let swapFeesTotalPast = 0;

  earningsCurrentPeriod?.income?.swap_fees.map(swapFee => {
    const correspondingPastSwapFee = earningsPastPeriod?.income.swap_fees.filter(
      pastSwapFee => pastSwapFee.info.symbol === swapFee.info.symbol,
    )[0];

    if (rates) {
      swapFeesTotalCurrent += swapFee.tokens * rates[swapFee.info.symbol].toNumber();
    }
    if (rates && correspondingPastSwapFee) {
      swapFeesTotalPast += correspondingPastSwapFee.tokens * rates[swapFee.info.symbol].toNumber();
    }

    return true;
  });

  let expensesTotalCurrent = 0;
  let expensesTotalPast = 0;

  earningsCurrentPeriod?.expenses.map(expense => {
    const correspondingPastExpense = earningsPastPeriod?.income.swap_fees.filter(
      pastExpense => pastExpense.info.symbol === expense.info.symbol,
    )[0];

    if (rates) {
      expensesTotalCurrent += expense.tokens * rates[expense.info.symbol].toNumber();
    }
    if (rates && correspondingPastExpense) {
      expensesTotalPast += correspondingPastExpense.tokens * rates[expense.info.symbol].toNumber();
    }

    return true;
  });

  return (
    <BoxPanel bg="bg2" mt={10} mb={10}>
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Typography variant="h2">Earnings</Typography>
        <Text>
          {`Income earned `}
          <ClickAwayListener onClickAway={closeDropdown}>
            <UnderlineTextWithArrow
              onClick={handleToggle}
              text={`past ${timePeriod.displayText}`}
              arrowRef={arrowRef}
            />
          </ClickAwayListener>
          <DropdownPopper show={Boolean(anchor)} anchorEl={anchor} placement="bottom-end">
            <MenuList>
              {Object.keys(earningPeriods).map(
                period =>
                  earningPeriods[period].days !== timePeriod.days && (
                    <MenuItem key={period} onClick={() => handlePeriodChange(period)}>
                      {earningPeriods[period].displayText}
                    </MenuItem>
                  ),
              )}
            </MenuList>
          </DropdownPopper>
        </Text>
      </Flex>
      <ScrollHelper>
        <IncomeGrid>
          <GridItemHeader>INCOME</GridItemHeader>
          <GridItemHeader>
            {formattedDates.current.dateStart} - {formattedDates.current.dateEnd}
          </GridItemHeader>
          <GridItemHeader>
            {formattedDates.past.dateStart} - {formattedDates.past.dateEnd}
          </GridItemHeader>
        </IncomeGrid>

        <IncomeGrid>
          <GridItemStrong>Loan fees</GridItemStrong>
          <GridItemStrong>
            {earningsCurrentPeriod ? (
              displayValueOrLoader(earningsCurrentPeriod?.income.loans_fees, rates && rates['bnUSD'].toNumber())
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemStrong>
          <GridItemStrong>
            {earningsPastPeriod ? (
              displayValueOrLoader(earningsPastPeriod?.income.loans_fees, rates && rates['bnUSD'].toNumber())
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemStrong>
        </IncomeGrid>

        <IncomeGrid>
          <GridItemLight>Balanced Dollars (bnUSD)</GridItemLight>
          <GridItemLight>
            {earningsCurrentPeriod ? (
              `${displayValueOrLoader(earningsCurrentPeriod?.income.loans_fees, 1, 'number')}`
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemLight>
          <GridItemLight>
            {earningsPastPeriod ? (
              `${displayValueOrLoader(earningsPastPeriod?.income.loans_fees, 1, 'number')}`
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemLight>
        </IncomeGrid>

        <IncomeGrid>
          <GridItemStrong>Swap fees</GridItemStrong>
          <GridItemStrong>
            {displayValueOrLoader(swapFeesTotalCurrent === 0 ? undefined : swapFeesTotalCurrent, 1)}
          </GridItemStrong>
          <GridItemStrong>
            {displayValueOrLoader(swapFeesTotalPast === 0 ? undefined : swapFeesTotalPast, 1)}
          </GridItemStrong>
        </IncomeGrid>

        {earningsCurrentPeriod ? (
          earningsCurrentPeriod.income?.swap_fees.map(swapFee => {
            const correspondingPastSwapFee = earningsPastPeriod?.income.swap_fees.filter(
              pastSwapFee => pastSwapFee.info.symbol === swapFee.info.symbol,
            )[0];

            return (
              <IncomeGrid key={swapFee.info.symbol}>
                <GridItemLight>{`${swapFee.info.displayName} (${swapFee.info.symbol})`}</GridItemLight>
                <GridItemLight>{`${displayValueOrLoader(swapFee.tokens, 1, 'number')} ${
                  swapFee.info.symbol
                }`}</GridItemLight>
                <GridItemLight>
                  {correspondingPastSwapFee && correspondingPastSwapFee.tokens > 1
                    ? `${displayValueOrLoader(correspondingPastSwapFee.tokens || 0, 1, 'number')} ${
                        swapFee.info.symbol
                      }`
                    : `-`}
                </GridItemLight>
              </IncomeGrid>
            );
          })
        ) : (
          <SkeletonPlaceholder />
        )}

        <IncomeGrid>
          <GridItemSubtotal>Subtotal</GridItemSubtotal>
          <GridItemSubtotal>
            {rates && earningsCurrentPeriod ? (
              displayValueOrLoader(
                earningsCurrentPeriod?.income.loans_fees * rates['bnUSD'].toNumber() + swapFeesTotalCurrent,
                1,
              )
            ) : (
              <LoaderComponent />
            )}
          </GridItemSubtotal>
          <GridItemSubtotal>
            {rates && earningsPastPeriod ? (
              displayValueOrLoader(
                earningsPastPeriod?.income.loans_fees * rates['bnUSD'].toNumber() + swapFeesTotalPast,
                1,
              )
            ) : (
              <LoaderComponent />
            )}
          </GridItemSubtotal>
        </IncomeGrid>

        <IncomeGrid>
          <GridItemHeader>Expenses</GridItemHeader>
          <GridItemHeader></GridItemHeader>
          <GridItemHeader></GridItemHeader>

          <GridItemStrong>Network fee payout</GridItemStrong>
          <GridItemStrong>
            {displayValueOrLoader(expensesTotalCurrent === 0 ? undefined : expensesTotalCurrent, 1)}
          </GridItemStrong>
          <GridItemStrong>
            {displayValueOrLoader(expensesTotalPast === 0 ? undefined : expensesTotalPast, 1)}
          </GridItemStrong>
        </IncomeGrid>

        {earningsCurrentPeriod ? (
          earningsCurrentPeriod.expenses.map(expense => {
            const correspondingPastExpense = earningsPastPeriod?.expenses.filter(
              pastExpense => pastExpense.info.symbol === expense.info.symbol,
            )[0];

            return (
              <IncomeGrid key={expense.info.symbol}>
                <GridItemLight>{`${expense.info.displayName} (${expense.info.symbol})`}</GridItemLight>
                <GridItemLight>{`${displayValueOrLoader(expense.tokens, 1, 'number')} ${
                  expense.info.symbol
                }`}</GridItemLight>
                <GridItemLight>
                  {correspondingPastExpense && correspondingPastExpense.tokens > 1
                    ? `${displayValueOrLoader(correspondingPastExpense.tokens || 0, 1, 'number')} ${
                        expense.info.symbol
                      }`
                    : `-`}
                </GridItemLight>
              </IncomeGrid>
            );
          })
        ) : (
          <SkeletonPlaceholder />
        )}

        <IncomeGrid>
          <GridItemTotal>Total</GridItemTotal>
          <GridItemTotal>
            {rates && earningsCurrentPeriod ? (
              displayValueOrLoader(
                earningsCurrentPeriod?.income.loans_fees * rates['bnUSD'].toNumber() +
                  swapFeesTotalCurrent -
                  expensesTotalCurrent,
                1,
              )
            ) : (
              <LoaderComponent />
            )}
          </GridItemTotal>
          <GridItemTotal>
            {rates && earningsPastPeriod ? (
              displayValueOrLoader(
                earningsPastPeriod?.income.loans_fees * rates['bnUSD'].toNumber() +
                  swapFeesTotalPast -
                  expensesTotalPast,
                1,
              )
            ) : (
              <LoaderComponent />
            )}
          </GridItemTotal>
        </IncomeGrid>
      </ScrollHelper>
    </BoxPanel>
  );
};

export default EarningsSection;

import React, { useState, useRef } from 'react';

import Skeleton from '@material-ui/lab/Skeleton';
import BigNumber from 'bignumber.js';
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
  DisplayValueOrLoader,
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

const SectionHeader = styled(Flex)`
  flex-direction: column;

  h2 {
    margin-bottom: 15px;
  }

  @media screen and (min-width: 500px) {
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    h2 {
      margin-bottom: 0;
    }
  }
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

  const loanFees = rates && earningsCurrentPeriod?.income.loans_fees.times(rates['bnUSD'].toNumber());
  const loanFeesPast = rates && earningsPastPeriod?.income.loans_fees.times(rates['bnUSD'].toNumber());

  let swapFeesTotalCurrent = new BigNumber(0);
  let swapFeesTotalPast = new BigNumber(0);

  earningsCurrentPeriod?.income?.swap_fees.map(swapFee => {
    const correspondingPastSwapFee = earningsPastPeriod?.income.swap_fees.filter(
      pastSwapFee => pastSwapFee.info.symbol === swapFee.info.symbol,
    )[0];

    if (rates) {
      swapFeesTotalCurrent = swapFeesTotalCurrent.plus(swapFee.tokens.times(rates[swapFee.info.symbol].toNumber()));
    }
    if (rates && correspondingPastSwapFee) {
      swapFeesTotalPast = swapFeesTotalPast.plus(
        correspondingPastSwapFee.tokens.times(rates[swapFee.info.symbol].toNumber()),
      );
    }

    return true;
  });

  let expensesTotalCurrent = new BigNumber(0);
  let expensesTotalPast = new BigNumber(0);

  earningsCurrentPeriod?.expenses.map(expense => {
    const correspondingPastExpense = earningsPastPeriod?.expenses.filter(
      pastExpense => pastExpense.info.symbol === expense.info.symbol,
    )[0];

    if (rates) {
      expensesTotalCurrent = expensesTotalCurrent.plus(expense.tokens.times(rates[expense.info.symbol].toNumber()));
    }
    if (rates && correspondingPastExpense) {
      expensesTotalPast = expensesTotalPast.plus(
        correspondingPastExpense.tokens.times(rates[expense.info.symbol].toNumber()),
      );
    }

    return true;
  });

  return (
    <BoxPanel bg="bg2" mt={10} mb={10}>
      <SectionHeader>
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
      </SectionHeader>
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
              <DisplayValueOrLoader value={loanFees} currencyRate={1} />
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemStrong>
          <GridItemStrong>
            {earningsPastPeriod ? (
              <DisplayValueOrLoader value={loanFeesPast} currencyRate={1} />
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemStrong>
        </IncomeGrid>

        <IncomeGrid>
          <GridItemLight>Balanced Dollar</GridItemLight>
          <GridItemLight>
            {earningsCurrentPeriod ? (
              <>
                <DisplayValueOrLoader
                  value={earningsCurrentPeriod?.income.loans_fees}
                  currencyRate={1}
                  format={'number'}
                />
                {` bnUSD`}
              </>
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemLight>
          <GridItemLight>
            {earningsPastPeriod ? (
              <>
                <DisplayValueOrLoader
                  value={earningsPastPeriod?.income.loans_fees}
                  currencyRate={1}
                  format={'number'}
                />
                {` bnUSD`}
              </>
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemLight>
        </IncomeGrid>

        <IncomeGrid>
          <GridItemStrong>Swap fees</GridItemStrong>
          <GridItemStrong>
            <DisplayValueOrLoader
              value={swapFeesTotalCurrent.eq(0) ? undefined : swapFeesTotalCurrent}
              currencyRate={1}
            />
          </GridItemStrong>
          <GridItemStrong>
            <DisplayValueOrLoader value={swapFeesTotalPast.eq(0) ? undefined : swapFeesTotalPast} currencyRate={1} />
          </GridItemStrong>
        </IncomeGrid>

        {earningsCurrentPeriod ? (
          earningsCurrentPeriod.income?.swap_fees.map(swapFee => {
            const correspondingPastSwapFee = earningsPastPeriod?.income.swap_fees.filter(
              pastSwapFee => pastSwapFee.info.symbol === swapFee.info.symbol,
            )[0];

            return (
              <IncomeGrid key={swapFee.info.symbol}>
                <GridItemLight>{`${swapFee.info.displayName}`}</GridItemLight>
                <GridItemLight>
                  <DisplayValueOrLoader value={swapFee.tokens} currencyRate={1} format={'number'} />
                  {` ${swapFee.info.symbol}`}
                </GridItemLight>
                <GridItemLight>
                  {correspondingPastSwapFee ? (
                    <>
                      <DisplayValueOrLoader
                        value={correspondingPastSwapFee.tokens || 0}
                        currencyRate={1}
                        format={'number'}
                      />
                      {` ${swapFee.info.symbol}`}
                    </>
                  ) : (
                    `-`
                  )}
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
              <DisplayValueOrLoader value={loanFees && loanFees.plus(swapFeesTotalCurrent)} currencyRate={1} />
            ) : (
              <LoaderComponent />
            )}
          </GridItemSubtotal>
          <GridItemSubtotal>
            {rates && earningsPastPeriod ? (
              <DisplayValueOrLoader value={loanFeesPast && loanFeesPast.plus(swapFeesTotalPast)} currencyRate={1} />
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
            <DisplayValueOrLoader
              value={expensesTotalCurrent.eq(0) ? undefined : expensesTotalCurrent}
              currencyRate={1}
            />
          </GridItemStrong>
          <GridItemStrong>
            <DisplayValueOrLoader value={expensesTotalPast.eq(0) ? undefined : expensesTotalPast} currencyRate={1} />
          </GridItemStrong>
        </IncomeGrid>

        {earningsCurrentPeriod ? (
          earningsCurrentPeriod.expenses.map(expense => {
            const correspondingPastExpense = earningsPastPeriod?.expenses.filter(
              pastExpense => pastExpense.info.symbol === expense.info.symbol,
            )[0];

            return (
              <IncomeGrid key={expense.info.symbol}>
                <GridItemLight>{`${expense.info.displayName}`}</GridItemLight>
                <GridItemLight>
                  <DisplayValueOrLoader value={expense.tokens} currencyRate={1} format={'number'} />
                  {` ${expense.info.symbol}`}
                </GridItemLight>
                <GridItemLight>
                  {correspondingPastExpense ? (
                    <>
                      <DisplayValueOrLoader
                        value={correspondingPastExpense.tokens || 0}
                        currencyRate={1}
                        format={'number'}
                      />
                      {` ${expense.info.symbol}`}
                    </>
                  ) : (
                    `-`
                  )}
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
              <DisplayValueOrLoader
                value={loanFees && loanFees.plus(swapFeesTotalCurrent).minus(expensesTotalCurrent)}
                currencyRate={1}
              />
            ) : (
              <LoaderComponent />
            )}
          </GridItemTotal>
          <GridItemTotal>
            {rates && earningsPastPeriod ? (
              <DisplayValueOrLoader
                value={loanFeesPast && loanFeesPast.plus(swapFeesTotalPast).minus(expensesTotalPast)}
                currencyRate={1}
              />
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

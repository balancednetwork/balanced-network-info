import React, { useState, useRef } from 'react';

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
} from 'pages/PerformanceDetails/utils';
import { StyledSkeleton as Skeleton } from 'sections/TokenSection';
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
  min-width: 800px;
`;

export const StyledSkeleton = styled(Skeleton)`
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

  const loanFees =
    rates &&
    earningsCurrentPeriod &&
    new BigNumber(earningsCurrentPeriod.income.loansFees.toFixed()).times(rates['bnUSD'].toNumber());
  const loanFeesPast =
    rates &&
    earningsPastPeriod &&
    new BigNumber(earningsPastPeriod.income.loansFees.toFixed()).times(rates['bnUSD'].toNumber());

  let swapFeesTotalCurrent = new BigNumber(0);
  let swapFeesTotalPast = new BigNumber(0);

  earningsCurrentPeriod &&
    Object.keys(earningsCurrentPeriod.income.swapFees).forEach(addr => {
      const curFee = earningsCurrentPeriod.income.swapFees[addr];
      const prevFee = earningsPastPeriod?.income.swapFees[addr];

      if (rates) {
        swapFeesTotalCurrent = swapFeesTotalCurrent.plus(
          new BigNumber(curFee.toFixed()).times(rates[curFee.currency.symbol!].toNumber()),
        );
      }
      if (rates && prevFee) {
        swapFeesTotalPast = swapFeesTotalPast.plus(
          new BigNumber(prevFee.toFixed()).times(rates[curFee.currency.symbol!].toNumber()),
        );
      }
    });

  let expensesTotalCurrent = new BigNumber(0);
  let expensesTotalPast = new BigNumber(0);

  earningsCurrentPeriod &&
    Object.keys(earningsCurrentPeriod.expenses).forEach(addr => {
      const curExpense = earningsCurrentPeriod.expenses[addr];
      const prevExpense = earningsPastPeriod?.expenses[addr];

      if (rates) {
        expensesTotalCurrent = expensesTotalCurrent.plus(
          new BigNumber(curExpense.toFixed()).times(rates[curExpense.currency.symbol!].toNumber()),
        );
      }
      if (rates && prevExpense) {
        expensesTotalPast = expensesTotalPast.plus(
          new BigNumber(prevExpense.toFixed()).times(rates[curExpense.currency.symbol!].toNumber()),
        );
      }
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
          <GridItemHeader style={{ paddingLeft: '25px' }}>
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
                  value={parseFloat(earningsCurrentPeriod?.income.loansFees.toFixed())}
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
                  value={parseFloat(earningsPastPeriod?.income.loansFees.toFixed())}
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
          Object.keys(earningsCurrentPeriod.income?.swapFees).map(addr => {
            const curFee = earningsCurrentPeriod.income.swapFees[addr];
            const prevFee = earningsPastPeriod?.income.swapFees[addr];

            return (
              <IncomeGrid key={curFee.currency.symbol}>
                <GridItemLight>{`${curFee.currency.name}`}</GridItemLight>
                <GridItemLight>
                  <DisplayValueOrLoader value={parseFloat(curFee.toFixed())} currencyRate={1} format={'number'} />
                  {` ${curFee.currency.symbol}`}
                </GridItemLight>
                <GridItemLight>
                  {prevFee ? (
                    <>
                      <DisplayValueOrLoader value={parseFloat(prevFee.toFixed())} currencyRate={1} format={'number'} />
                      {` ${curFee.currency.symbol}`}
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
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemSubtotal>
          <GridItemSubtotal>
            {rates && earningsPastPeriod ? (
              <DisplayValueOrLoader value={loanFeesPast && loanFeesPast.plus(swapFeesTotalPast)} currencyRate={1} />
            ) : (
              <StyledSkeleton animation="wave" width={100} />
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
          Object.keys(earningsCurrentPeriod.expenses).map(addr => {
            const curExpense = earningsCurrentPeriod?.expenses[addr];
            const prevExpense = earningsPastPeriod?.expenses[addr];

            return (
              <IncomeGrid key={curExpense.currency.symbol}>
                <GridItemLight>{`${curExpense.currency.name}`}</GridItemLight>
                <GridItemLight>
                  <DisplayValueOrLoader value={parseFloat(curExpense.toFixed())} currencyRate={1} format={'number'} />
                  {` ${curExpense.currency.symbol}`}
                </GridItemLight>
                <GridItemLight>
                  {prevExpense ? (
                    <>
                      <DisplayValueOrLoader
                        value={parseFloat(prevExpense.toFixed())}
                        currencyRate={1}
                        format={'number'}
                      />
                      {` ${curExpense.currency.symbol}`}
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
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemTotal>
          <GridItemTotal>
            {rates && earningsPastPeriod ? (
              <DisplayValueOrLoader
                value={loanFeesPast && loanFeesPast.plus(swapFeesTotalPast).minus(expensesTotalPast)}
                currencyRate={1}
              />
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemTotal>
        </IncomeGrid>
      </ScrollHelper>
    </BoxPanel>
  );
};

export default EarningsSection;

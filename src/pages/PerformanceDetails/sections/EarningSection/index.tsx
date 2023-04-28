import React, { useState, useRef } from 'react';

import BigNumber from 'bignumber.js';
import { useEarningsDataQuery } from 'queries';
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
  grid-template-columns: 3fr 3fr 3fr;
  align-items: stretch;
  min-width: 700px;
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

  let swapFeesTotalCurrent =
    earningsCurrentPeriod &&
    Object.values(earningsCurrentPeriod.income.swaps).reduce(
      (total, feeItem) => total.plus(feeItem.value),
      new BigNumber(0),
    );
  let swapFeesTotalPast =
    earningsPastPeriod &&
    Object.values(earningsPastPeriod.income.swaps).reduce(
      (total, feeItem) => total.plus(feeItem.value),
      new BigNumber(0),
    );

  // let networkFeesTotalCurrent =
  //   earningsCurrentPeriod &&
  //   Object.values(earningsCurrentPeriod.income.fees).reduce(
  //     (total, feeItem) => total.plus(feeItem.value),
  //     new BigNumber(0),
  //   );
  // let networkFeesTotalPast =
  //   earningsPastPeriod &&
  //   Object.values(earningsPastPeriod.income.fees).reduce(
  //     (total, feeItem) => total.plus(feeItem.value),
  //     new BigNumber(0),
  //   );

  let expensesTotalCurrent = earningsCurrentPeriod ? earningsCurrentPeriod.feesDistributed : new BigNumber(0);
  let expensesTotalPast = earningsPastPeriod ? earningsPastPeriod.feesDistributed : new BigNumber(0);

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
              <DisplayValueOrLoader value={earningsCurrentPeriod.income.loans} currencyRate={1} />
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemStrong>
          <GridItemStrong>
            {earningsPastPeriod ? (
              <DisplayValueOrLoader value={earningsPastPeriod.income.loans} currencyRate={1} />
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
                  value={parseFloat(earningsCurrentPeriod?.income.loans.toFixed())}
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
                  value={parseFloat(earningsPastPeriod?.income.loans.toFixed())}
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
          <GridItemStrong>Stability Fund fees</GridItemStrong>
          <GridItemStrong>
            {earningsCurrentPeriod ? (
              <DisplayValueOrLoader value={earningsCurrentPeriod.income.fund} currencyRate={1} />
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemStrong>
          <GridItemStrong>
            {earningsPastPeriod ? (
              <DisplayValueOrLoader value={earningsPastPeriod.income.fund} currencyRate={1} />
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
                  value={parseFloat(earningsCurrentPeriod?.income.fund.toFixed())}
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
                  value={parseFloat(earningsPastPeriod?.income.fund.toFixed())}
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
              value={swapFeesTotalCurrent?.eq(0) ? undefined : swapFeesTotalCurrent}
              currencyRate={1}
            />
          </GridItemStrong>
          <GridItemStrong>
            <DisplayValueOrLoader value={swapFeesTotalPast?.eq(0) ? undefined : swapFeesTotalPast} currencyRate={1} />
          </GridItemStrong>
        </IncomeGrid>

        {earningsCurrentPeriod ? (
          <>
            <IncomeGrid>
              <GridItemLight>Balanced Dollar</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsCurrentPeriod.income.swaps['bnUSD'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` bnUSD`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsPastPeriod?.income.swaps['bnUSD'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` bnUSD`}
              </GridItemLight>
            </IncomeGrid>
            <IncomeGrid>
              <GridItemLight>Balance Token</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsCurrentPeriod.income.swaps['BALN'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` BALN`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsPastPeriod?.income.swaps['BALN'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` BALN`}
              </GridItemLight>
            </IncomeGrid>
            <IncomeGrid>
              <GridItemLight>Staked ICX</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsCurrentPeriod.income.swaps['sICX'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` sICX`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsPastPeriod?.income.swaps['sICX'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` sICX`}
              </GridItemLight>
            </IncomeGrid>
          </>
        ) : (
          <SkeletonPlaceholder />
        )}

        {/* <IncomeGrid>
          <GridItemStrong>Liquidity rewards</GridItemStrong>
          <GridItemStrong>
            <DisplayValueOrLoader value={earningsCurrentPeriod?.income.liquidity.value} currencyRate={1} />
          </GridItemStrong>
          <GridItemStrong>
            <DisplayValueOrLoader value={earningsPastPeriod?.income.liquidity.value} currencyRate={1} />
          </GridItemStrong>
        </IncomeGrid>

        <IncomeGrid>
          <GridItemLight>Balance Token</GridItemLight>
          <GridItemLight>
            {earningsCurrentPeriod ? (
              <>
                <DisplayValueOrLoader
                  value={earningsCurrentPeriod.income.liquidity.amount || 0}
                  currencyRate={1}
                  format={'number'}
                />
                {` BALN`}
              </>
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemLight>
          <GridItemLight>
            {earningsPastPeriod ? (
              <>
                <DisplayValueOrLoader
                  value={earningsPastPeriod?.income.liquidity.amount || 0}
                  currencyRate={1}
                  format={'number'}
                />
                {` BALN`}
              </>
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemLight>
        </IncomeGrid>

        <IncomeGrid>
          <GridItemStrong>Network fee rewards</GridItemStrong>
          <GridItemStrong>
            <DisplayValueOrLoader value={networkFeesTotalCurrent} currencyRate={1} />
          </GridItemStrong>
          <GridItemStrong>
            <DisplayValueOrLoader value={networkFeesTotalPast} currencyRate={1} />
          </GridItemStrong>
        </IncomeGrid> */}

        {/* {earningsCurrentPeriod ? (
          <>
            <IncomeGrid>
              <GridItemLight>Balanced Dollar</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={
                    earningsCurrentPeriod.income.fees[bnJs.bnUSD.address]
                      ? earningsCurrentPeriod.income.fees[bnJs.bnUSD.address].amount
                      : 0
                  }
                  currencyRate={1}
                  format={'number'}
                />
                {` bnUSD`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={
                    earningsPastPeriod?.income.fees[bnJs.bnUSD.address]
                      ? earningsPastPeriod?.income.fees[bnJs.bnUSD.address].amount
                      : 0
                  }
                  currencyRate={1}
                  format={'number'}
                />
                {` bnUSD`}
              </GridItemLight>
            </IncomeGrid>
            <IncomeGrid>
              <GridItemLight>Balance Token</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={
                    earningsCurrentPeriod.income.fees[bnJs.BALN.address]
                      ? earningsCurrentPeriod.income.fees[bnJs.BALN.address].amount
                      : 0
                  }
                  currencyRate={1}
                  format={'number'}
                />
                {` BALN`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={
                    earningsPastPeriod?.income.fees[bnJs.BALN.address]
                      ? earningsPastPeriod?.income.fees[bnJs.BALN.address].amount
                      : 0
                  }
                  currencyRate={1}
                  format={'number'}
                />
                {` BALN`}
              </GridItemLight>
            </IncomeGrid>
            <IncomeGrid>
              <GridItemLight>Staked ICX</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={
                    earningsCurrentPeriod.income.fees[bnJs.sICX.address]
                      ? earningsCurrentPeriod.income.fees[bnJs.sICX.address].amount
                      : 0
                  }
                  currencyRate={1}
                  format={'number'}
                />
                {` sICX`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={
                    earningsPastPeriod?.income.fees[bnJs.bnUSD.address]
                      ? earningsPastPeriod?.income.fees[bnJs.bnUSD.address].amount
                      : 0
                  }
                  currencyRate={1}
                  format={'number'}
                />
                {` sICX`}
              </GridItemLight>
            </IncomeGrid>
          </>
        ) : (
          <SkeletonPlaceholder />
        )} */}

        <IncomeGrid>
          <GridItemSubtotal>Subtotal</GridItemSubtotal>
          <GridItemSubtotal>
            {earningsCurrentPeriod && swapFeesTotalCurrent ? (
              <DisplayValueOrLoader
                value={
                  earningsCurrentPeriod.income.loans
                    .plus(swapFeesTotalCurrent)
                    // .plus(networkFeesTotalCurrent)
                    .plus(earningsCurrentPeriod.income.fund)
                  // .plus(earningsCurrentPeriod.income.liquidity.value)
                }
                currencyRate={1}
              />
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemSubtotal>
          <GridItemSubtotal>
            {earningsPastPeriod && swapFeesTotalPast ? (
              <DisplayValueOrLoader
                value={
                  earningsPastPeriod.income.loans
                    .plus(swapFeesTotalPast)
                    // .plus(networkFeesTotalPast)
                    .plus(earningsPastPeriod.income.fund)
                  // .plus(earningsPastPeriod.income.liquidity.value)
                }
                currencyRate={1}
              />
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
          <>
            <IncomeGrid>
              <GridItemLight>Balanced Dollar</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsCurrentPeriod.expenses['bnUSD'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` bnUSD`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsPastPeriod?.expenses['bnUSD'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` bnUSD`}
              </GridItemLight>
            </IncomeGrid>
            <IncomeGrid>
              <GridItemLight>Balance Token</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsCurrentPeriod.expenses['BALN'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` BALN`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsPastPeriod?.expenses['BALN'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` BALN`}
              </GridItemLight>
            </IncomeGrid>
            <IncomeGrid>
              <GridItemLight>Staked ICX</GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsCurrentPeriod.expenses['sICX'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` sICX`}
              </GridItemLight>
              <GridItemLight>
                <DisplayValueOrLoader
                  value={earningsPastPeriod?.expenses['sICX'].amount}
                  currencyRate={1}
                  format={'number'}
                />
                {` sICX`}
              </GridItemLight>
            </IncomeGrid>
          </>
        ) : (
          <SkeletonPlaceholder />
        )}

        <IncomeGrid>
          <GridItemTotal>Total</GridItemTotal>
          <GridItemTotal>
            {earningsCurrentPeriod && swapFeesTotalCurrent ? (
              <DisplayValueOrLoader
                value={earningsCurrentPeriod.income.loans
                  .plus(swapFeesTotalCurrent)
                  .plus(earningsCurrentPeriod.income.fund)
                  // .plus(networkFeesTotalCurrent)
                  // .plus(earningsCurrentPeriod.income.liquidity.value)
                  .minus(expensesTotalCurrent)}
                currencyRate={1}
              />
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemTotal>
          <GridItemTotal>
            {earningsPastPeriod && swapFeesTotalPast ? (
              <DisplayValueOrLoader
                value={earningsPastPeriod.income.loans
                  .plus(swapFeesTotalPast)
                  .plus(earningsPastPeriod.income.fund)
                  // .plus(networkFeesTotalPast)
                  // .plus(earningsPastPeriod.income.liquidity.value)
                  .minus(expensesTotalPast)}
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

import React, { useState, useRef } from 'react';

import Skeleton from '@material-ui/lab/Skeleton';
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
  displayValueOrLoader,
  dateOptionShort,
  dateOptionLong,
  FormattedPeriods,
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

const IncomeGrid = styled.div`
  display: grid;
  grid-template-columns: 4fr 3fr 3fr;
  align-items: stretch;
  min-width: 700px;
`;

const StyledSkeleton = styled(Skeleton)`
  background-color: rgba(44, 169, 183, 0.2) !important;
  height: 32px;
  margin-left: auto;
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

          <GridItemStrong>Loan fees</GridItemStrong>
          <GridItemStrong>
            {earningsCurrentPeriod ? (
              displayValueOrLoader(earningsCurrentPeriod?.income.loans_fees_USD)
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemStrong>
          <GridItemStrong>
            {earningsPastPeriod ? (
              displayValueOrLoader(earningsPastPeriod?.income.loans_fees_USD)
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemStrong>

          <GridItemLight>Balanced Dollars (bnUSD)</GridItemLight>
          <GridItemLight>
            {earningsCurrentPeriod ? (
              `${displayValueOrLoader(earningsCurrentPeriod?.income.loans_fees, 'number')}`
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemLight>
          <GridItemLight>
            {earningsPastPeriod ? (
              `${displayValueOrLoader(earningsPastPeriod?.income.loans_fees, 'number')}`
            ) : (
              <StyledSkeleton animation="wave" width={100} />
            )}
          </GridItemLight>

          <GridItemStrong>Swap fees</GridItemStrong>
          <GridItemStrong>**$200,000.00</GridItemStrong>
          <GridItemStrong>**$500,000.00</GridItemStrong>

          <GridItemLight>Balance Tokens (BALN)</GridItemLight>
          <GridItemLight>**75,000</GridItemLight>
          <GridItemLight>**90,000</GridItemLight>

          <GridItemLight>Balanced Dollars (bnUSD)</GridItemLight>
          <GridItemLight>**50,000</GridItemLight>
          <GridItemLight>**200,000</GridItemLight>

          <GridItemLight>Staked ICX (sICX)</GridItemLight>
          <GridItemLight>**75,000</GridItemLight>
          <GridItemLight>**50,000</GridItemLight>

          <GridItemSubtotal>Subtotal</GridItemSubtotal>
          <GridItemSubtotal>{displayValueOrLoader(earningsCurrentPeriod?.income.loans_fees_USD)}</GridItemSubtotal>
          <GridItemSubtotal>{displayValueOrLoader(earningsPastPeriod?.income.loans_fees_USD)}</GridItemSubtotal>

          <GridItemHeader>Expenses</GridItemHeader>
          <GridItemHeader></GridItemHeader>
          <GridItemHeader></GridItemHeader>

          <GridItemStrong>Network fee payout</GridItemStrong>
          <GridItemStrong>**$300,000.00</GridItemStrong>
          <GridItemStrong>**$900,000.00</GridItemStrong>

          <GridItemLight>Balance Tokens (BALN)</GridItemLight>
          <GridItemLight>**60,000</GridItemLight>
          <GridItemLight>**1,000,000</GridItemLight>

          <GridItemLight>Balanced Dollars (bnUSD)</GridItemLight>
          <GridItemLight>**120,000</GridItemLight>
          <GridItemLight>**360,000</GridItemLight>

          <GridItemLight>Staked ICX (sICX)</GridItemLight>
          <GridItemLight>**80,000</GridItemLight>
          <GridItemLight>**240,000</GridItemLight>

          <GridItemTotal>Total</GridItemTotal>
          <GridItemTotal>{displayValueOrLoader(earningsCurrentPeriod?.income.loans_fees_USD)}</GridItemTotal>
          <GridItemTotal>{displayValueOrLoader(earningsPastPeriod?.income.loans_fees_USD)}</GridItemTotal>
        </IncomeGrid>
      </ScrollHelper>
    </BoxPanel>
  );
};

export default EarningsSection;

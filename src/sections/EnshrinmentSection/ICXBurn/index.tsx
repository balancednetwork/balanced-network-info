import dayjs from 'dayjs';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { useBurnData } from 'queries/burn';
import React from 'react';
import { Flex } from 'rebass';
import { Bar, BarChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { ChartInfo, ChartInfoItem, ChartWrap } from 'sections/BALNSection/DistributionChart';
import styled, { useTheme } from 'styled-components';
import { Typography } from 'theme';
import { formatYAxisNumber, getFormattedNumber } from 'utils/formatter';

const TooltipWrapper = styled.div`
  background: ${({ theme }) => theme.colors.bg4};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  transform: translateX(calc(-50% - 11px));
  position: relative;

  strong,
  span {
    color: ${({ theme }) => theme.colors.text};
  }

  label {
    color: ${({ theme }) => theme.colors.text1};
  }
`;

const CustomTooltip = ({ active, payload, timestamp }) => {
  if (active && payload && payload.length) {
    const { value, timestamp } = payload[0].payload;
    return (
      <TooltipWrapper>
        <span>
          <strong>{getFormattedNumber(value, 'number')} ICX</strong>
        </span>
        <label>{getLabel(timestamp)}</label>
      </TooltipWrapper>
    );
  }

  return null;
};

function getLabel(label: number) {
  return dayjs(label).format('MMM YYYY');
}

const ICXBurn = () => {
  const { data: burnData } = useBurnData();
  const theme = useTheme();

  return (
    <>
      <Flex justifyContent="space-between" mb="25px">
        <Typography variant="h3" mr="10px">
          ICX burned
        </Typography>
        <Typography fontSize={20} fontWeight="bold" color="text">
          {burnData ? `${burnData.totalBurn.toFormat(0)} ICX` : <LoaderComponent />}
        </Typography>
      </Flex>

      <ChartWrap visibleOverflow>
        {burnData?.chartData && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={burnData?.chartData}
              margin={{
                top: 0,
                right: 35,
                left: 0,
                bottom: 0,
              }}
            >
              {/* <XAxis
                dataKey="timestamp"
                axisLine={false}
                tickLine={false}
                tick={{ stroke: theme.colors.text1, fontSize: '14px' }}
                tickFormatter={time => dayjs(time).format('MMM')}
              /> */}
              <YAxis
                dataKey="value"
                axisLine={false}
                tickLine={false}
                orientation="right"
                tick={{ stroke: theme.colors.text1, fontSize: '14px' }}
                tickFormatter={value => formatYAxisNumber(value, value > 100 ? 1 : 2)}
                width={5}
                domain={[`auto`, 'auto']}
                padding={{ top: 10, bottom: 10 }}
              />
              <Bar dataKey="pending" stackId="a" fill="#C4C9D0" />
              <Bar dataKey="value" fill={theme.colors.primary} stackId="a" radius={[10, 10, 0, 0]} />
              <Tooltip
                cursor={false}
                // @ts-ignore
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: true, y: true }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartWrap>

      <ChartInfo mt="25px">
        <ChartInfoItem border>
          <Typography fontSize={18} color="text">
            {burnData ? `${burnData.awaitingBurn.toFormat(0)} ICX` : <LoaderComponent />}
          </Typography>
          <Typography fontSize={14} color="text1">
            Awaiting burn
          </Typography>
        </ChartInfoItem>
        <ChartInfoItem>
          <Typography fontSize={18} color="text">
            {burnData ? `${burnData.pastMonthBurn.toFormat(0)} ICX` : <LoaderComponent />}
          </Typography>
          <Typography fontSize={14} color="text1">
            Burned past month
          </Typography>
        </ChartInfoItem>
      </ChartInfo>
    </>
  );
};

export default ICXBurn;

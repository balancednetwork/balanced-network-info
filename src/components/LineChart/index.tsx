import React, { Dispatch, SetStateAction, ReactNode } from 'react';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import styled from 'styled-components';

import Card from 'components/Card';
import { RowBetween } from 'components/Row';
import useTheme from 'hooks/useTheme';
import { formatYAxisNumber } from 'utils/formatter';

dayjs.extend(utc);

export const DEFAULT_HEIGHT = 260;

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 0;
  display: flex;
  background-color: transparent;
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`;

export type LineChartProps = {
  data: any[];
  color?: string | undefined;
  height?: number | undefined;
  minHeight?: number;
  setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>>; // used for label of valye
  value?: number;
  label?: string;
  topLeft?: ReactNode | undefined;
  topRight?: ReactNode | undefined;
  bottomLeft?: ReactNode | undefined;
  bottomRight?: ReactNode | undefined;
} & React.HTMLAttributes<HTMLDivElement>;

const Chart = ({
  data,
  color = '#56B2A4',
  value,
  label,
  setValue,
  setLabel,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const theme = useTheme();
  const parsedValue = value;

  return (
    <Wrapper minHeight={minHeight} {...rest}>
      <RowBetween>
        {topLeft ?? null}
        {topRight ?? null}
      </RowBetween>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={260}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          onMouseLeave={() => {
            setLabel && setLabel(undefined);
            setValue && setValue(undefined);
          }}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            minTickGap={10}
            tick={{ stroke: theme.colors.text1, fontSize: '14px' }}
            tickFormatter={time => dayjs(time).format('DD')}
          />
          <YAxis
            dataKey="value"
            axisLine={false}
            tickLine={false}
            orientation="right"
            tick={{ stroke: 'white' }}
            tickFormatter={value => formatYAxisNumber(value, 0)}
            width={20}
          />

          <Tooltip
            cursor={{ stroke: theme.colors.text1 }}
            contentStyle={{ display: 'none' }}
            formatter={(value: number, name: string, props: { payload: { time: string; value: number } }) => {
              if (setValue && parsedValue !== props.payload.value) {
                setValue(props.payload.value);
              }
              const formattedTime = dayjs(props.payload.time).format('MMM D, YYYY');
              if (setLabel && label !== formattedTime) setLabel(formattedTime);
            }}
          />
          <Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      <RowBetween>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </RowBetween>
    </Wrapper>
  );
};

export default Chart;

import React from 'react';

import { useAllTokensByAddress } from 'queries/backendv2';
import { Link } from 'react-router-dom';
import { Flex } from 'rebass';
import styled from 'styled-components';

import arrowIcon from 'assets/icons/arrow.svg';
import bnJs from 'bnJs';
import { BoxPanel } from 'components/Panel';
import { LINKS } from 'constants/links';
import useTimestampRounded from 'hooks/useTimestampRounded';
import { LoaderComponent } from 'pages/PerformanceDetails/utils';
import { ChartsWrap } from 'sections/BALNSection';
import { Typography } from 'theme';
import { getFormattedNumber } from 'utils/formatter';

import POLChart from './POLChart';
import { useDAOFundTotal } from './queries';
import TokensChart from './TokensChart';

const StyledArrowLink = styled(Link)`
  color: #2fccdc;
  text-decoration: none;
  line-height: 40px;
  position: relative;
  padding: 0 30px 0 0;
  margin-top: -17px;

  &:after {
    content: '';
    display: block;
    position: absolute;
    background-image: url(${arrowIcon});
    height: 10px;
    width: 20px;
    background-repeat: no-repeat;
    top: 16px;
    right: 0;
    transform: translate3d(5px, 0, 0);
    transition: transform 0.3s ease;
  }

  &:hover {
    &:after {
      transform: translate3d(15px, 0, 0);
    }
  }
`;

const BALNSectionOverview = () => {
  const now = useTimestampRounded();
  const before = useTimestampRounded(1000 * 60, 30);
  const daoFundNow = useDAOFundTotal(now);
  const daoFundBefore = useDAOFundTotal(before);

  return (
    <BoxPanel bg="bg2">
      <Flex
        alignItems={['start', 'center']}
        justifyContent="space-between"
        flexWrap="wrap"
        flexDirection={['column', 'row']}
        mb={[3, 0]}
      >
        <Flex alignItems="center" mb={['-8px', '0']}>
          <Typography variant="h2" mb={5} mr={2}>
            Holdings
          </Typography>
          <Typography color="text1" mb={3} fontSize={16}>
            {daoFundNow ? `$${getFormattedNumber(daoFundNow.total, 'number')}` : <LoaderComponent />}
          </Typography>
        </Flex>
        <StyledArrowLink to={LINKS.performanceDetails}>Performance details</StyledArrowLink>
      </Flex>
      <ChartsWrap>
        <TokensChart />
        <POLChart />
      </ChartsWrap>
    </BoxPanel>
  );
};

export default BALNSectionOverview;

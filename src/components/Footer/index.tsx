import React from 'react';

import { Flex, Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as Logo } from 'assets/images/logo.svg';
import { Button } from 'components/Button';
import AnimatedLink from 'components/uikit/AnimatedLink';

const DesktopMenu = styled(Flex)`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;

const Grid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 50px 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 25px 0;
  `}
`;

const Footer = () => {
  return (
    <>
      <Grid>
        <Flex>
          <Box width={[80, 85, 120]}>
            <Logo width="100%" />
          </Box>
        </Flex>
        <DesktopMenu flexDirection="column" alignItems="flex-end" justifyContent="center">
          <Flex mb="16px" alignItems="center">
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Why Balanced
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              How it works
            </AnimatedLink>
            <Button
              style={{ marginLeft: 25, fontSize: 18, padding: '3px 20px', lineHeight: '35px' }}
              as="a"
              target="_blank"
              href="https://app.balanced.network"
            >
              Go to app
            </Button>
          </Flex>
          <Flex alignItems="center">
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Airdrip
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Brand
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Demo
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Docs
            </AnimatedLink>
          </Flex>
        </DesktopMenu>
      </Grid>
      <Grid>
        <Box>
          <Text>© Balanced 2021, All rights reserved.</Text>
          <AnimatedLink
            style={{ marginLeft: 0, display: 'inline-block' }}
            as="a"
            target="_blank"
            href="https://app.balanced.network"
          >
            Disclaimer
          </AnimatedLink>
          {' | '}
          <AnimatedLink
            style={{ marginLeft: 0, display: 'inline-block' }}
            as="a"
            target="_blank"
            href="https://app.balanced.network"
          >
            Bug bounty
          </AnimatedLink>
        </Box>
        <DesktopMenu flexDirection="column" alignItems="flex-end" justifyContent="center">
          <Flex mb="16px" alignItems="center">
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Why Balanced
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              How it works
            </AnimatedLink>
            <Button
              style={{ marginLeft: 25, fontSize: 18, padding: '3px 20px', lineHeight: '35px' }}
              as="a"
              target="_blank"
              href="https://app.balanced.network"
            >
              Go to app
            </Button>
          </Flex>
          <Flex alignItems="center">
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Airdrip
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Brand
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Demo
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href="https://app.balanced.network">
              Docs
            </AnimatedLink>
          </Flex>
        </DesktopMenu>
      </Grid>
    </>
  );
};

export default Footer;

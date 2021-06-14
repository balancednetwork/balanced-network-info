import React from 'react';

import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as Logo } from 'assets/images/logo.svg';
import { Button } from 'components/Button';
import AnimatedLink from 'components/uikit/AnimatedLink';
import OutlineButton from 'components/uikit/OutlineButton';

const DesktopMenu = styled(Flex)`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`;

const BurgerMenu = styled(Flex)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
  `}
`;

const Header = () => {
  return (
    <Box as="header" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', my: ['25px', '50px'] }}>
      <Flex>
        <Box width={[80, 85, 120]}>
          <Logo width="100%" />
        </Box>
      </Flex>
      <DesktopMenu alignItems="center" justifyContent="flex-end">
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
      </DesktopMenu>

      <BurgerMenu alignItems="center" justifyContent="flex-end">
        <OutlineButton>menu</OutlineButton>
      </BurgerMenu>
    </Box>
  );
};

export default Header;

import React from 'react';

import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as Logo } from 'assets/images/logo.svg';
import { Button } from 'components/Button';
import AnimatedLink from 'components/uikit/AnimatedLink';
import OutlineButton from 'components/uikit/OutlineButton';
import useBoolean from 'hooks/useBoolean';

import BurgerMenu from './Burger';

const DesktopMenu = styled(Flex)`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;

const BurgerMenuContainer = styled(Flex)`
  display: none;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
  `}
`;

const Grid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 2fr;
  margin: 50px 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 25px 0;
  `}
`;

const Header = () => {
  const { toggle, state } = useBoolean();
  return (
    <Grid>
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

      <BurgerMenuContainer alignItems="center" justifyContent="flex-end">
        <OutlineButton className={state ? 'active' : ''} onClick={toggle}>
          Menu
        </OutlineButton>
        <BurgerMenu show={state} />
      </BurgerMenuContainer>
    </Grid>
  );
};

export default Header;

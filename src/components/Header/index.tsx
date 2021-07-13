import React from 'react';

import { Flex, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import { Button } from 'components/Button';
import AnimatedLink from 'components/Button/AnimatedLink';
import OutlineButton from 'components/Button/OutlineButton';
import { LINKS } from 'constants/links';
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
        <Box width={[80, 85, 100]}>
          <Logo width="100%" />
        </Box>
      </Flex>
      <DesktopMenu sx={{ a: { marginLeft: 25 } }} alignItems="center" justifyContent="flex-end">
        <AnimatedLink as="a" target="_blank" href={LINKS.why}>
          Why Balanced
        </AnimatedLink>
        <AnimatedLink as="a" target="_blank" href={LINKS.howitworks}>
          How it works
        </AnimatedLink>
        <AnimatedLink as="a" target="_blank" href={LINKS.stats}>
          Stats
        </AnimatedLink>
        <Button
          style={{ marginLeft: 25, fontSize: 16, padding: '3px 20px', lineHeight: '35px' }}
          as="a"
          target="_blank"
          href={LINKS.app}
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
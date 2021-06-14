import React from 'react';

import { Flex, Box } from 'rebass/styled-components';

import { ReactComponent as Logo } from 'assets/images/logo.svg';
import { Button } from 'components/Button';
import AnimatedLink from 'components/uikit/AnimatedLink';
import OutlineButton from 'components/uikit/OutlineButton';

const Header = () => {
  return (
    <Box as="header" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', my: '50px' }}>
      <Flex>
        <Logo width={125} />
      </Flex>
      <Flex alignItems="center" justifyContent="flex-end">
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

        <OutlineButton>menu</OutlineButton>
      </Flex>
    </Box>
  );
};

export default Header;

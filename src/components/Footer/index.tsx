import React from 'react';

import { Flex, Box, Text, Link } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as Discord } from 'assets/icons/discord.svg';
import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import { ReactComponent as Reddit } from 'assets/icons/reddit.svg';
import Revue from 'assets/icons/revue.png';
import { ReactComponent as Telegram } from 'assets/icons/telegram.svg';
import { ReactComponent as Twitter } from 'assets/icons/twitter.svg';
import { Button } from 'components/Button';
import AnimatedLink from 'components/Button/AnimatedLink';
import SocialButton from 'components/Button/SocialButton';
import { LINKS, SOCIAL_LINKS } from 'constants/links';

const Grid = styled(Box)`
  display: grid;
  grid-template-columns: auto 1fr;
  margin: 50px 0;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: 25px 0 ;
    grid-template-columns: none;
    grid-template-rows: auto 1fr;
    justify-content: center;

  `}

  .footer-right-menu {
    a:not(.top-right-menu-item),
    button {
      margin: 0;
      margin-left: 25px;
      ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        margin-left: 0;
        margin-bottom: 3px;
      `}
    }
  }

  &.footer-social {
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      flex-direction: column-reverse;
    `}
  }
`;

const StyledFlex = styled(Flex)`
  margin-bottom: 20px;
  align-items: center;

  a {
    margin: 0 0 -9px 25px;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-bottom: 10px;
    a {
      margin: 0 0 3px 0;
    }
  `}
`;

const Footer = () => {
  return (
    <>
      <Grid>
        <Flex marginBottom={[15, 0]} alignItems="center" justifyContent={['center', 'flex-start']}>
          <Box width="100px">
            <Link href="https://balanced.network/">
              <Logo width="100%" />
            </Link>
          </Box>
        </Flex>
        <Flex
          className="footer-right-menu"
          flexDirection="column"
          alignItems={['center', 'flex-end']}
          justifyContent="center"
        >
          <StyledFlex flexDirection={['column', 'row']}>
            <AnimatedLink className="top-right-menu-item" as="a" href={LINKS.howitworks}>
              How it works
            </AnimatedLink>
            <AnimatedLink className="top-right-menu-item" as="a" href={LINKS.stats} active={true}>
              Stats
            </AnimatedLink>
            <AnimatedLink className="top-right-menu-item" as="a" href={LINKS.blog}>
              Blog
            </AnimatedLink>
            <AnimatedLink className="top-right-menu-item" as="a" href={LINKS.forum}>
              Forum
            </AnimatedLink>
            <Button style={{ fontSize: 16, padding: '3px 20px', lineHeight: '35px' }} as="a" href={LINKS.app}>
              Go to app
            </Button>
          </StyledFlex>
          <Flex flexDirection={['column', 'row']} alignItems="center">
            <AnimatedLink as="a" href={LINKS.airdrip}>
              Airdrip
            </AnimatedLink>
            <AnimatedLink as="a" href={LINKS.demo}>
              Demo
            </AnimatedLink>
            <AnimatedLink as="a" href={LINKS.docs}>
              Docs
            </AnimatedLink>
          </Flex>
        </Flex>
      </Grid>
      <Flex pb={40} flexDirection={['column-reverse', 'row']} className="footer-social">
        <Box
          sx={{
            textAlign: ['center', 'left'],
          }}
        >
          <Text>© Balanced 2021, All rights reserved.</Text>
          <AnimatedLink style={{ marginLeft: 0, display: 'inline-block' }} as="a" href={LINKS.disclamer}>
            Disclaimer
          </AnimatedLink>
          {' | '}
          <AnimatedLink style={{ marginLeft: 0, display: 'inline-block' }} as="a" href={LINKS.bugBounty}>
            Bug bounty
          </AnimatedLink>
          {' | '}
          <AnimatedLink style={{ marginLeft: 0, display: 'inline-block' }} as="a" href={LINKS.brand}>
            Brand
          </AnimatedLink>
        </Box>
        <Flex
          sx={{ flex: 1, a: { margin: '0 9px' }, mb: [15, 0] }}
          alignItems="center"
          justifyContent={['center', 'flex-end']}
        >
          <SocialButton as="a" href={SOCIAL_LINKS.twitter}>
            <Twitter height={16} />
          </SocialButton>
          <SocialButton as="a" href={SOCIAL_LINKS.reddit}>
            <Reddit height={16} />
          </SocialButton>
          <SocialButton as="a" href={SOCIAL_LINKS.telegram}>
            <Telegram height={16} />
          </SocialButton>
          <SocialButton as="a" href={SOCIAL_LINKS.discord}>
            <Discord height={16} />
          </SocialButton>
          <SocialButton style={{ marginRight: 0 }} as="a" href={SOCIAL_LINKS.revue}>
            <img alt="revue" src={Revue} height={16} />
          </SocialButton>
        </Flex>
      </Flex>
    </>
  );
};

export default Footer;

import React from 'react';

import { Flex, Box, Text, Link } from 'rebass/styled-components';
import styled from 'styled-components';

import { ReactComponent as Logo } from 'assets/icons/logo.svg';
import { ReactComponent as Medium } from 'assets/icons/medium.svg';
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
    margin: 25px 0;
    grid-template-columns: none;
    grid-template-rows: auto 1fr;
    justify-content: center;

  `}

  .footer-right-menu {
    a,
    button {
      margin: 0;
      margin-left: 25px;
      ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        margin-left: 0;
      `}
    }
  }

  &.footer-social {
    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      flex-direction: column-reverse;
    `}
  }
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
          <Flex flexDirection={['column', 'row']} mb="16px" alignItems="center">
            <AnimatedLink as="a" target="_blank" href={LINKS.why}>
              Why Balanced
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href={LINKS.howitworks}>
              How it works
            </AnimatedLink>
            <Button
              style={{ fontSize: 16, padding: '3px 20px', lineHeight: '35px' }}
              as="a"
              target="_blank"
              href={LINKS.app}
            >
              Go to app
            </Button>
          </Flex>
          <Flex flexDirection={['column', 'row']} alignItems="center">
            <AnimatedLink as="a" target="_blank" href={LINKS.airdrip}>
              Airdrip
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href={LINKS.brand}>
              Brand
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href={LINKS.demo}>
              Demo
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href={LINKS.docs}>
              Docs
            </AnimatedLink>
            <AnimatedLink as="a" target="_blank" href={LINKS.stats} active={true}>
              Stats
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
          <AnimatedLink
            style={{ marginLeft: 0, display: 'inline-block' }}
            as="a"
            target="_blank"
            href={LINKS.disclamer}
          >
            Disclaimer
          </AnimatedLink>
          {' | '}
          <AnimatedLink
            style={{ marginLeft: 0, display: 'inline-block' }}
            as="a"
            target="_blank"
            href={LINKS.bugBounty}
          >
            Bug bounty
          </AnimatedLink>
        </Box>
        <Flex
          sx={{ flex: 1, a: { margin: '0 9px' }, mb: [15, 0] }}
          alignItems="center"
          justifyContent={['center', 'flex-end']}
        >
          <SocialButton as="a" target="_blank" href={SOCIAL_LINKS.twitter}>
            <Twitter height={16} />
          </SocialButton>
          <SocialButton as="a" target="_blank" href={SOCIAL_LINKS.telegram}>
            <Telegram height={16} />
          </SocialButton>
          <SocialButton as="a" target="_blank" href={SOCIAL_LINKS.reddit}>
            <Reddit height={16} />
          </SocialButton>
          <SocialButton as="a" target="_blank" href={SOCIAL_LINKS.medium}>
            <Medium height={16} />
          </SocialButton>
          <SocialButton style={{ marginRight: 0 }} as="a" target="_blank" href={SOCIAL_LINKS.revue}>
            <img alt="revue" src={Revue} height={16} />
          </SocialButton>
        </Flex>
      </Flex>
    </>
  );
};

export default Footer;

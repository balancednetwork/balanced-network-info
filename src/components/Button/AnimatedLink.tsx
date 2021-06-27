import styled from 'styled-components';

const AnimatedLink = styled.a`
  text-decoration: none;
  line-height: 35px;
  position: relative;
  font-size: 16px;
  color: #ffffff;
  padding-bottom: 3px;
  margin-bottom: -9px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}
  &:hover {
    &:after {
      width: 100%;
    }
  }
  &:after {
    content: '';
    display: block;
    width: 0px;
    height: 3px;
    margin-top: 3px;
    background-image: linear-gradient(120deg, #2ca9b7, #1b648f);
    border-radius: 3px;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
`;
export default AnimatedLink;

import React, { useCallback, useState } from 'react';

import styled from 'styled-components';

import { ReactComponent as QuestionIcon } from 'assets/icons/question.svg';
import Tooltip from 'components/Tooltip';

export const QuestionWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  outline: none;
  cursor: help;
  color: ${({ theme }) => theme.colors.text1};
`;

export default function QuestionHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false);

  const open = useCallback(() => setShow(true), [setShow]);
  const close = useCallback(() => setShow(false), [setShow]);

  return (
    <span style={{ marginLeft: 4, verticalAlign: 'middle' }}>
      <Tooltip text={text} show={show} placement="top">
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <QuestionIcon width={14} />
        </QuestionWrapper>
      </Tooltip>
    </span>
  );
}

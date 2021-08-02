import React from 'react';

import { CurrencyKey } from 'constants/currency';
import { getCurrencyKeyIcon } from 'utils';

type CurrencyIconProps = {
  currencyKey: CurrencyKey;
  width: string | number | undefined;
  height: string | number | undefined;
};

function CurrencyIcon({ currencyKey, width, height }: CurrencyIconProps) {
  const Icon = getCurrencyKeyIcon(currencyKey);

  return <Icon width={width} height={height} />;
}

export default CurrencyIcon;

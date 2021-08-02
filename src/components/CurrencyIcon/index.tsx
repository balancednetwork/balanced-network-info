import React from 'react';

import { CurrencyKey } from 'constants/currency';
import { getCurrencyKeyIcon } from 'utils';

function CurrencyIcon({
  currencyKey,
  width,
  height,
}: {
  currencyKey: CurrencyKey;
  width: string | number | undefined;
  height: string | number | undefined;
}) {
  const Icon = getCurrencyKeyIcon(currencyKey);

  return <Icon width={width} height={height} />;
}

export default CurrencyIcon;

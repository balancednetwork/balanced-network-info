import React from 'react';

import { Helmet } from 'react-helmet-async';

import Footer from 'components/Footer';
import Header from 'components/Header';
import { Container, Divider } from 'pages/StatsPage';
import { Typography } from 'theme';

export function FinancialStatements() {
  return (
    <Container>
      <Helmet>
        <title>Financial Statements | Balanced</title>
      </Helmet>

      <Header />

      <Typography fontWeight="bold" fontSize={[45, 45, 60]} color="#fff">
        Financial statements
      </Typography>

      <Divider />
      <Footer />
    </Container>
  );
}

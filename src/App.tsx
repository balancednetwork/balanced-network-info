import React from 'react';

import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme';

import { PerformanceDetailsPage } from './pages/PerformanceDetails/Loadable';
import { StatsPage } from './pages/StatsPage/Loadable';

const queryClient = new QueryClient();

export function App() {
  const { i18n } = useTranslation();

  return (
    <>
      <FixedGlobalStyle />
      <ThemeProvider>
        <ThemedGlobalStyle />

        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Helmet htmlAttributes={{ lang: i18n.language }}>
              <meta name="description" content="A Balanced Network interface" />
            </Helmet>

            <Switch>
              <Route exact path="/" component={StatsPage} />
              <Route exact path="/performance-details" component={PerformanceDetailsPage} />
              <Route
                component={() => {
                  window.location.href = 'https://balanced.network/404';
                  return null;
                }}
              />
            </Switch>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}

import React from 'react';

import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme';

import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { StatsPage } from './pages/StatsPage/Loadable';
import { TokenPage } from './pages/TokenPage/Loadable';

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
            <Helmet
              titleTemplate="%s - Balanced Network"
              defaultTitle="Balanced Network"
              htmlAttributes={{ lang: i18n.language }}
            >
              <meta name="description" content="A Balanced Network interface" />
            </Helmet>

            <Switch>
              <Route exact path="/" component={StatsPage} />
              <Route exact path="/info-:ticker" component={TokenPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}

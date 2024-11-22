import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ROUTES from './constants/ROUTES';

const App = () => {
  return (
    <Router>
      <div className="App">
        <div className="content-wrapper">
          <Routes>
            <Route path={ROUTES.PATHS.login} element={<ROUTES.PAGES.Login />} />
            <Route path={ROUTES.PATHS.register} element={<ROUTES.PAGES.Register />} />
            <Route path={ROUTES.PATHS.dashboard} element={<ROUTES.PAGES.Dashboard />} />
            <Route path={ROUTES.PATHS.devices} element={<ROUTES.PAGES.Devices />} />
            <Route path={ROUTES.PATHS.notFound} element={<ROUTES.PAGES.NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

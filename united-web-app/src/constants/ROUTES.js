const ROUTES = {
  PATHS: {
    login: '/',
    register: '/register',
    dashboard: '/dashboard',
    devices: '/devices',
    notFound: '*',
  },
  PAGES: {
    Login: require('../pages/login/Login').default,
    Register: require('../pages/register/Register').default,
    Dashboard: require('../pages/dashboard/Dashboard').default,
    Devices: require('../pages/devices/Devices').default,
    NotFound: require('../pages/notFound/NotFound').default,
  },
};

export default ROUTES;

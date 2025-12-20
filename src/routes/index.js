import auth from './auth.routes.js';
import company from './company.routes.js';
import product from './product.routes.js';
// import user from './user.routes.js';

const registerRoutes = (app) => {
  app.use('/api/auth', auth);
  app.use('/api/companies', company);
  app.use('/api/products', product);
  // app.use('/api/users', user);
};

export default registerRoutes;
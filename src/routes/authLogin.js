import controllerAuth from '../controllers/authLogin.js';
import  Router  from '@koa/router';
import router from './index.js';

const route = new Router();
const controller = controllerAuth();

route.post('/', controller.login);

export default route;
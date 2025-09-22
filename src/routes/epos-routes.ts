import { Router } from 'express';
import { createCustomer, deleteCustomer, getCustomerById, getCustomers, updateCustomer } from '../controllers/epos/epos-controller';


const router = Router();

// Customer routes
router.get('/Customer', getCustomers); // GET /api/customers
router.get('/Customer/:id', getCustomerById); // GET /api/customers/:id
router.post('/Customer', createCustomer); // POST /api/customers
router.put('/Customer', updateCustomer); // PUT /api/customers/:id
router.delete('/Customer', deleteCustomer); // DELETE /api/customers/:id
export { router };
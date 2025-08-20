import { Request, Response } from 'express';
import { createEposNowService } from '../../services/epos/epos-service';

const eposNowService = createEposNowService();

/**
 * Handler to get a list of customers.
 */
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    res.status(400).json({ error: 'Request body is empty or invalid' });
    return;
  }

  try {
    const newCustomer = await eposNowService.createData('Customer', data);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
};
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;

  try {
    const customers = await eposNowService.getData('Customer', page);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

/**
 * Handler to get a customer by ID.
 */
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid customer ID' });
    return;
  }

  try {
    const customer = await eposNowService.getDataById('Customer', id);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch customer with ID ${id}` });
  }
};

/**
 * Handler to update a customer by ID.
 */
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  // if (isNaN(id)) {
  //   res.status(400).json({ error: 'Invalid customer ID' });
  //   return;
  // }

  try {
    const updatedCustomer = await eposNowService.updateData('Customer', data);
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: `Failed to update customer with ID ` });
  }
};

/**
 * Handler to delete a customer by ID.
 */
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  try {
    const result = await eposNowService.deleteData('Customer', data);
    res.json({ message: `Customer with ID deleted successfully`, result });
  } catch (error) {
    res.status(500).json({ error: `Failed to delete customer with ID ` });
  }
};

/**
 * Handler to get a list of products (for reference).
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;

  try {
    const products = await eposNowService.getData('Products', page);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};



import { Request, Response } from 'express';
import { createEposNowService } from '../../services/epos/epos-service';

const eposNowService = createEposNowService();


export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    res.status(400).json({ error: 'Request body is empty or invalid' });
    return;
  }

  try {
    const newWebhook = await eposNowService.createData('Webhook', data, 'v4');
    res.status(201).json(newWebhook);
  } catch (error) {
    console.error('Create webhook error:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
};

/**
 * Handler to get webhooks
 */
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  try {
    // const webhooks = await eposNowService.getData('Transaction', page);
    // const webhooks = await eposNowService.getData('Location', page);
    const webhooks = await eposNowService.getData('Device', page, 'v4');
    res.json(webhooks);
  } catch (error) {
    console.error('Get webhooks error:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
};

/**
 * Handler to get a customer by ID (keeping original functionality)
 */
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid customer ID' });
    return;
  }

  try {
    // const customer = await eposNowService.getDataById('DiscountReason', id);
    const customer = await eposNowService.getDataById('Device', id, 'V2');
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch customer with ID ${id}` });
  }
};

/**
 * FIXED: Handler to update webhook BaseUrl using PATCH method with plain text
 */
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  const { BaseUrl } = req.body;

  if (!BaseUrl || typeof BaseUrl !== 'string') {
    res.status(400).json({ 
      error: 'BaseUrl is required as a string for webhook update' 
    });
    return;
  }

  // Trim any whitespace from the BaseUrl
  const cleanBaseUrl = BaseUrl.trim();

  try {
    // Use the specific webhook update method with clean BaseUrl
    const updatedWebhook = await eposNowService.updateWebhook(cleanBaseUrl);
    res.json({
      message: 'Webhook BaseUrl updated successfully',
      data: updatedWebhook
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({ error: 'Failed to update webhook BaseUrl' });
  }
};

/**
 * FIXED: Handler to delete webhook triggers using direct array format
 */
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  const { triggerIds } = req.body;

  // Validate that triggerIds is an array of numbers
  if (!triggerIds || !Array.isArray(triggerIds) || triggerIds.length === 0) {
    res.status(400).json({ 
      error: 'triggerIds array with at least one trigger ID is required for webhook deletion' 
    });
    return;
  }

  // Validate that all elements are numbers
  const validTriggerIds = triggerIds.every(id => 
    typeof id === 'number' && Number.isInteger(id) && id > 0
  );

  if (!validTriggerIds) {
    res.status(400).json({ 
      error: 'All triggerIds must be positive integers' 
    });
    return;
  }

  try {
    const result = await eposNowService.deleteWebhook(triggerIds);
    res.json({ 
      message: 'Webhook triggers deleted successfully', 
      result,
      deletedTriggerIds: triggerIds
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    res.status(500).json({ error: 'Failed to delete webhook triggers' });
  }
};

/**
 * Handler to get a list of products (for reference)
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;

  try {
    // const products = await eposNowService.getData('Transaction', page);
    const products = await eposNowService.getData('Device', page);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
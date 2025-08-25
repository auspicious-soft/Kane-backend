// import { Request, Response } from 'express';
// import { createEposNowService } from '../../services/epos/epos-service';

// const eposNowService = createEposNowService();

// /**
//  * Handler to get a list of customers.
//  */

// export const createCustomer = async (req: Request, res: Response): Promise<void> => {
//   const data = req.body;
//   console.log('data: ', data);

//   if (!data || Object.keys(data).length === 0) {
//     res.status(400).json({ error: 'Request body is empty or invalid' });
//     return;
//   }

//   try {
//     // Validate webhook creation payload structure
//     if (!data.BaseUrl || !data.Triggers || !Array.isArray(data.Triggers)) {
//       res.status(400).json({ 
//         error: 'Invalid webhook payload. Required: BaseUrl and Triggers array' 
//       });
//       return;
//     }

//     const newWebhook = await eposNowService.createData('Webhook', data);
//     res.status(201).json(newWebhook);
//   } catch (error) {
//     console.error('Create webhook error:', error);
//     res.status(500).json({ error: 'Failed to create webhook' });
//   }
// };

// // export const createCustomer = async (req: Request, res: Response): Promise<void> => {
// //   const data = req.body;
// //   console.log('data: ', data);

// //   if (!data || Object.keys(data).length === 0) {
// //     res.status(400).json({ error: 'Request body is empty or invalid' });
// //     return;
// //   }
// //   try {
// //     // const newCustomer = await eposNowService.createData('CustomerPoints', data);
// //     const newCustomer = await eposNowService.createData('Webhook', data);
// //     res.status(201).json(newCustomer);
// //   } catch (error) {
// //     res.status(500).json({ error: 'Failed to create customer' });
// //   }
// // };



// export const getCustomers = async (req: Request, res: Response): Promise<void> => {
//   const page = parseInt(req.query.page as string) || 1;
//   try {
//     // const customers = await eposNowService.getData('Customer', page);
//     const customers = await eposNowService.getData('Webhook', page);
//     res.json(customers);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch customers' });
//   }
// };

// /**
//  * Handler to get a customer by ID.
//  */
// export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
//   const id = parseInt(req.params.id);

//   if (isNaN(id)) {
//     res.status(400).json({ error: 'Invalid customer ID' });
//     return;
//   }

//   try {
//     const customer = await eposNowService.getDataById('Customer', id);
//     res.json(customer);
//   } catch (error) {
//     res.status(500).json({ error: `Failed to fetch customer with ID ${id}` });
//   }
// };

// /**
//  * Handler to update a customer by ID.
//  */
// // export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
// //   const data = req.body;

// //   // if (isNaN(id)) {
// //   //   res.status(400).json({ error: 'Invalid customer ID' });
// //   //   return;
// //   // }
// // // const payload = {
// // //     BaseUrl: 'https://607193071527.ngrok-free.app', // Replace with existing BaseUrl if known
// // //     AuthenticationKey: null,
// // //     AuthenticationSecret: null,
// // //     ApiVersion: 4,
// // //     MimeType: 2,
// // //     IncludeInAutomaticEndOfDayReports: false,
// // //     Triggers: [
// // //       { EventTypeId: 81, Path: '/webhook/receive' },
// // //       { EventTypeId: 82, Path: '/webhook/receive' },
// // //       { EventTypeId: 304, Path: '/webhook/receive' },
// // //     ],
// // //   };

// //   // try {
// //   //   const response = await eposNowService.updateData<any>('Webhook', payload);
// //   //   console.log('Webhook updated:', response);
// //   //   return response;
// //   try {
// //     // const updatedCustomer = await eposNowService.updateData('Customer', data);
// //     const updatedCustomer = await eposNowService.updateData('Webhook', data);
// //     res.json(updatedCustomer);
// //   } catch (error) {
// //     console.log('error: ', error);
// //     res.status(500).json({ error: `Failed to update customer with ID ` });
// //   }
// // };

// /**
//  * Handler to delete a customer by ID.
//  */
// // export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
// //   const data = req.body;
// //   console.log('data: ', data);
// //   try {
// //     const result = await eposNowService.deleteData('Webhook', data);
// //     res.json({ message: `Customer with ID deleted successfully`, result });
// //   } catch (error) {
// //     res.status(500).json({ error: `Failed to delete customer with ID ` });
// //   }
// // };

// /**
//  * Handler to get a list of products (for reference).
//  */
// export const getProducts = async (req: Request, res: Response): Promise<void> => {
//   const page = parseInt(req.query.page as string) || 1;

//   try {
//     const products = await eposNowService.getData('Products', page);
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// };


// export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
//   const { BaseUrl } = req.body;

//   if (!BaseUrl) {
//     res.status(400).json({ error: 'BaseUrl is required for webhook update' });
//     return;
//   }

//   try {
//     // Use the specific webhook update method
//     const updatedWebhook = await eposNowService.updateWebhook(BaseUrl);
//     res.json({
//       message: 'Webhook BaseUrl updated successfully',
//       data: updatedWebhook
//     });
//   } catch (error) {
//     console.error('Update webhook error:', error);
//     res.status(500).json({ error: 'Failed to update webhook BaseUrl' });
//   }
// };

// /**
//  * FIXED: Handler to delete webhook triggers using proper payload structure
//  */
// export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
//   const { triggerIds } = req.body;

//   if (!triggerIds || !Array.isArray(triggerIds)) {
//     res.status(400).json({ 
//       error: 'triggerIds array is required for webhook deletion' 
//     });
//     return;
//   }

//   try {
//     const result = await eposNowService.deleteWebhook(triggerIds);
//     res.json({ 
//       message: 'Webhook triggers deleted successfully', 
//       result 
//     });
//   } catch (error) {
//     console.error('Delete webhook error:', error);
//     res.status(500).json({ error: 'Failed to delete webhook triggers' });
//   }
// };






import { Request, Response } from 'express';
import { createEposNowService } from '../../services/epos/epos-service';

const eposNowService = createEposNowService();

/**
 * Handler to create a webhook
 */

// export const createCustomer = async (req: Request, res: Response): Promise<void> => {
//   const data = req.body;

//   if (!data || Object.keys(data).length === 0) {
//     res.status(400).json({ error: 'Request body is empty or invalid' });
//     return;
//   }

//   try {
//     const newCustomer = await eposNowService.createData('CustomerPoints', data);
//     res.status(201).json(newCustomer);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create customer' });
//   }
// };
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    res.status(400).json({ error: 'Request body is empty or invalid' });
    return;
  }

  try {
    // Validate webhook creation payload structure
    // if (!data.BaseUrl || !data.Triggers || !Array.isArray(data.Triggers)) {
    //   res.status(400).json({ 
    //     error: 'Invalid webhook payload. Required: BaseUrl and Triggers array' 
    //   });
    //   return;
    // }

    const newWebhook = await eposNowService.createData('Webhook', data);
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
    const webhooks = await eposNowService.getData('Webhook', page);
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
    const customer = await eposNowService.getDataById('Customer', id);
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
    const products = await eposNowService.getData('Products', page);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
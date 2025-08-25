// import axios, { AxiosInstance } from 'axios';

// // Define valid endpoint types for type safety
// type EposNowEndpoint = 'Product' | 'Customer' | 'Transactions' | string;

// export const createEposNowService = () => {
//   const accessKey = process.env.EPOSNOW_ACCESS_KEY;
//   const accessToken = process.env.EPOSNOW_SECRET_KEY;
//   const apiVersion = process.env.EPOSNOW_API_VERSION || 'v4'; // Default to v4, configurable to v1

//   if (!accessKey || !accessToken) {
//     throw new Error('Epos Now API credentials are missing.');
//   }

//   // const api: AxiosInstance = axios.create({
//   //   baseURL: `http://api.eposnowhq.com/api/${apiVersion}/`,
//   //   headers: {
//   //     'Content-Type': 'application/xml',
//   //     'Authorization': `Basic ${Buffer.from(`${accessKey}:${accessToken}`).toString('base64')}`,
//   //   },
//   // });

//   const api: AxiosInstance = axios.create({
//     baseURL: `https://api.eposnowhq.com/api/${apiVersion}/`, // Use HTTPS for security
//     headers: {
//       'Content-Type': 'application/json', // Changed to JSON
//       'Authorization': `Basic ${Buffer.from(`${accessKey}:${accessToken}`).toString('base64')}`,
//     },
//   });

//   // Add request and response interceptors for debugging
//   // api.interceptors.request.use((config) => {
//   //   console.log('Request:', JSON.stringify(config, null, 2));
//   //   return config;
//   // });
//   // api.interceptors.response.use(
//   //   (response) => response,
//   //   (error) => {
//   //     console.error('Response Error:', JSON.stringify(error.response?.data, null, 2));
//   //     console.error('Full Error:', error);
//   //     throw error;
//   //   }
//   // );

// api.interceptors.request.use((config) => {
//     console.log('Request:', JSON.stringify(config, null, 2));
//     return config;
//   });
//   api.interceptors.response.use(
//     (response) => {
//       console.log('Response:', JSON.stringify(response.data, null, 2));
//       return response;
//     },
//     (error) => {
//       console.error('Response Error:', JSON.stringify(error.response?.data, null, 2));
//       console.error('Full Error:', error);
//       throw error;
//     }
//   );

//   /**
//    * Generic method to fetch a list of data from a specified Epos Now API endpoint.
//    * @param endpoint - API endpoint (e.g., Customer, Product).
//    * @param page - Page number for pagination (default: 1).
//    * @returns Data from the API.
//    */
//   const getData = async <T>(endpoint: EposNowEndpoint, page: number = 1): Promise<T> => {
//     try {
//       const response = await api.get(endpoint, {
//         params: { page },
//       });
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching data from ${endpoint}:`, error);
//       throw error;
//     }
//   };

//   /**
//    * Generic method to fetch a single resource by ID from a specified Epos Now API endpoint.
//    * @param endpoint - API endpoint (e.g., Customers, Products).
//    * @param id - Resource ID.
//    * @returns Data for the resource.
//    */
//   const getDataById = async <T>(endpoint: EposNowEndpoint, id: number): Promise<T> => {
//     try {
//       const response = await api.get(`${endpoint}/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching ${endpoint} by ID ${id}:`, error);
//       throw error;
//     }
//   };

//   /**
//    * Generic method to create a new resource at a specified Epos Now API endpoint.
//    * @param endpoint - API endpoint (e.g., Customers, Products).
//    * @param data - Data to create the resource (XML format).
//    * @returns Created resource data.
//    */
//   // const createData = async <T>(endpoint: EposNowEndpoint, data: any) => {
//   //   try {
//   //     const response = await api.post(endpoint, data);
//   //     return response.data;
//   //   } catch (error) {
//   //     console.error(`Error creating resource at ${endpoint}:`, error);
//   //     throw error;
//   //   }
//   // };

// const createData = async <T>(endpoint: EposNowEndpoint, data: any): Promise<T> => {
//     try {
//       // Ensure data is a valid JSON object
//       if (!data || typeof data !== 'object') {
//         throw new Error('Invalid data payload: JSON object required');
//       }

//       const response = await api.post(endpoint, data);
//       return response.data;
//     } catch (error) {
//       console.error(`Error creating resource at ${endpoint}:`, error);
//       throw error;
//     }
//   };

//   /**
//    * Generic method to update a resource by ID at a specified Epos Now API endpoint.
//    * @param endpoint - API endpoint (e.g., Customers, Products).
//    * @param id - Resource ID.
//    * @param data - Data to update the resource (XML format).
//    * @returns Updated resource data.
//    */
//   const updateData = async <T>(endpoint: EposNowEndpoint,  data: any): Promise<T> => {
//     try {
//       const response = await api.put(`${endpoint}`, data);
//       return response.data;
//     } catch (error) {
//       console.error(`Error updating ${endpoint}:`, error);
//       throw error;
//     }
//   };

//   /**
//    * Generic method to delete a resource by ID from a specified Epos Now API endpoint.
//    * @param endpoint - API endpoint (e.g., Customers, Products).
//    * @param id - Resource ID.
//    * @returns Deletion result.
//    */
//   // const deleteData = async <T>(endpoint: EposNowEndpoint, data: any): Promise<T> => {
//   //   console.log('data: ', data);
//   //   try {
//   //     const response = await api.delete(`${endpoint}`,data);
//   //     console.log('response: ', response);
//   //     return response.data;
//   //   } catch (error) {
//   //     console.error(`Error deleting ${endpoint}:`, error);
//   //     throw error;
//   //   }
//   // };

//   const deleteData = async <T>(endpoint: EposNowEndpoint,  data?: any): Promise<T> => {
//   console.log('data: ', data);
//   try {
//     const response = await api.delete(`${endpoint}`, {
//       data: data
//     });
//     console.log('response: ', response);
//     return response.data;
//   } catch (error) {
//     console.error(`Error deleting ${endpoint}:`, error);
//     throw error;
//   }
// };
// const deleteWebhook = async <T>(triggerIds: number[]): Promise<T> => {
//     try {
//       const payload = {
//         triggerIds: triggerIds
//       };
      
//       const response = await api.delete('Webhook', {
//         data: payload
//       });
//       return response.data;
//     } catch (error) {
//       console.error(`Error deleting webhook:`, error);
//       throw error;
//     }
//   };
//   const updateWebhook = async <T>(baseUrl: string): Promise<T> => {
//     try {
//       const payload = {
//         BaseUrl: baseUrl
//       };
      
//       const response = await api.patch('Webhook', payload);
//       return response.data;
//     } catch (error) {
//       console.error(`Error updating webhook:`, error);
//       throw error;
//     }
//   };

//   return { getData, getDataById, createData, updateData, deleteData, updateWebhook, deleteWebhook };
// };




import axios, { AxiosInstance } from 'axios';

// Define valid endpoint types for type safety
type EposNowEndpoint = 'Product' | 'Customer' | 'Transactions' | 'Webhook' | string;

export const createEposNowService = () => {
  const accessKey = process.env.EPOSNOW_ACCESS_KEY;
  const accessToken = process.env.EPOSNOW_SECRET_KEY;
  const apiVersion = process.env.EPOSNOW_API_VERSION || 'v4';

  if (!accessKey || !accessToken) {
    throw new Error('Epos Now API credentials are missing.');
  }

  const api: AxiosInstance = axios.create({
    baseURL: `https://api.eposnowhq.com/api/${apiVersion}/`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${accessKey}:${accessToken}`).toString('base64')}`,
    },
  });

  // Add request and response interceptors for debugging
api.interceptors.request.use((config) => {
    // console.log('Request:', JSON.stringify(config, null, 2));
    return config;
  });
  api.interceptors.response.use(
    (response) => {
    //  console.log('Response:', JSON.stringify(response.data, null, 2));        
     return response;
    },
    (error) => {
      console.error('Response Error:', JSON.stringify(error.response?.data, null, 2));
      console.error('Full Error:', error);
      throw error;
    }
  );

  /**
   * Generic method to fetch a list of data from a specified Epos Now API endpoint.
   */
  const getData = async <T>(endpoint: EposNowEndpoint, page: number = 1): Promise<T> => {
    try {
      const response = await api.get(endpoint, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  };

  /**
   * Generic method to fetch a single resource by ID from a specified Epos Now API endpoint.
   */
  const getDataById = async <T>(endpoint: EposNowEndpoint, id: number): Promise<T> => {
    try {
      const response = await api.get(`${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint} by ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Generic method to create a new resource at a specified Epos Now API endpoint.*/
const createData = async <T>(endpoint: EposNowEndpoint, data: any): Promise<T> => {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data payload: JSON object required');
      }

      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating resource at ${endpoint}:`, error);
      throw error;
    }
  };

  /**
   * FIXED: Update webhook using PATCH method with string payload
   * Based on the error logs, the API expects a plain string, not JSON object
   */
  // const updateWebhook = async <T>(baseUrl: string): Promise<T> => {
  //   try {
  //     // Create a temporary axios instance with text/plain content type
  //     const textApi = axios.create({
  //       baseURL: api.defaults.baseURL,
  //       headers: {
  //         'Content-Type': 'text/plain',
  //         'Authorization': api.defaults.headers['Authorization'],
  //       },
  //     });
      
  //     const response = await textApi.patch('Webhook', baseUrl);
  //     return response.data;
  //   } catch (error) {
  //     console.error(`Error updating webhook:`, error);
  //     throw error;
  //   }
  // };

    const updateWebhook = async <T>(baseUrl: string): Promise<T> => {
    try {
      // Try different payload structures based on what might be expected
      
      // Option 1: Try with baseUrl1 parameter name as shown in docs
      // let payload = { baseUrl1: baseUrl };
      const payload = baseUrl;
      
      try {
        const response = await api.patch('Webhook', payload);
        return response.data;
      } catch (error) {
        console.log('Failed with baseUrl1, trying BaseUrl...');
        
        // Option 2: Try with BaseUrl (capital B)
        // payload = { BaseUrl: baseUrl };
        let payload: Record<string, string> = { baseUrl1: baseUrl };
        const response = await api.patch('Webhook', payload);
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating webhook:`, error);
      throw error;
    }
  };

  /**
   * FIXED: Generic update method using PUT (keeping for backward compatibility)
   */
  const updateData = async <T>(endpoint: EposNowEndpoint,  data: any): Promise<T> => {
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  };

  /**
   * FIXED: Delete webhook using proper array format
   * Based on the error logs, the API expects a direct array of integers, not an object
   */
  const deleteWebhook = async <T>(triggerIds: number[]): Promise<T> => {
    try {
      // Send the array directly, not wrapped in an object
      const response = await api.delete('Webhook', {
        data: triggerIds
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting webhook:`, error);
      throw error;
    }
  };

  /**
   * Generic delete method (keeping for backward compatibility)
   */
  const deleteData = async <T>(endpoint: EposNowEndpoint, data?: any): Promise<T> => {
    try {
      const response = await api.delete(endpoint, {
        data: data
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  };

  return { 
    getData, 
    getDataById, 
    createData, 
    updateData, 
    updateWebhook, // New specific webhook update method
    deleteData, 
    deleteWebhook // New specific webhook delete method
  };
};
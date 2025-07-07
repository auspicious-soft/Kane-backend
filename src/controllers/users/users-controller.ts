import { Request, Response } from "express";
import { errorParser, errorResponseHandler, formatErrorResponse } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import Busboy from "busboy";
import { Readable } from "stream";
import {

  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  getCurrentUserService,
  blockUserService,
  getUserHistoryService,
  getAllBlockedUsersService,
  changePasswordService,
  homePageService,
  inviteCodeAndReferredDetailsService,
  getUserPointHistoryService,
  getTopLeadersService,
  uploadStreamToS3Service,
 
} from "../../services/users/users-service";

// Get All Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const response = await getAllUsersService(req.query);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getAllBlockedUsers = async (req: Request, res: Response) => {
  try {
    const response = await getAllBlockedUsersService(req.query);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Get User by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const response = await getUserByIdService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getUserHistory = async (req: Request, res: Response) => {
  try {
    const response = await getUserHistoryService(req.params.id, req.query, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const response = await getCurrentUserService(req.user, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getUserPointHistory = async (req: Request, res: Response) => {
  try {
    const response = await getUserPointHistoryService(req.user, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Update User
export const updateUser = async (req: Request, res: Response) => {
  try {
    const response = await updateUserService(req.params.id, req.body,req.query, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const getTopLeaders = async (req: Request, res: Response) => {
  try {
    const response = await getTopLeadersService(req.query,res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const response = await deleteUserService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const blockUser = async (req: Request, res: Response) => {
  try {
    const response = await blockUserService(req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const changePassword = async (req: Request, res: Response) => {
  try {
    const response = await changePasswordService(req.user,req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const userHomePage = async (req: Request, res: Response) => {
  try {
    const response = await homePageService(req.user,req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};
export const inviteCodeAndReferredDetails= async (req: Request, res: Response) => {
  try {
    const response = await inviteCodeAndReferredDetailsService(req.user,req.query, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res
      .status(code || httpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: message || "An error occurred" });
  }
};

export const uploadUserImageController = async (req: Request, res: Response) => {
  try {
    const userData = req.user as any;
    const userEmail = userData.email || req.query.email as string;
    
    if (!userEmail) {
      return errorResponseHandler('User email is required', httpStatusCode.BAD_REQUEST, res);
    }
    
    // Check content type
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      return errorResponseHandler('Content-Type must be multipart/form-data', httpStatusCode.BAD_REQUEST, res);
    }
    const busboy = Busboy({ headers: req.headers });
    let uploadPromise: Promise<string> | null = null;
    
    busboy.on('file', async (fieldname: string, fileStream: any, fileInfo: any) => {
      if (fieldname !== 'image') {
        fileStream.resume(); // Skip this file
        return;
      }
      
      const { filename, mimeType } = fileInfo;
      
      // Create a readable stream from the file stream
      const readableStream = new Readable();
      readableStream._read = () => {}; // Required implementation
      
      fileStream.on('data', (chunk :any) => {
        readableStream.push(chunk);
      });
      
      fileStream.on('end', () => {
        readableStream.push(null); // End of stream
      });
      
      uploadPromise = uploadStreamToS3Service(
        readableStream,
        filename,
        mimeType,
        userEmail
      );
    });
    
    busboy.on('finish', async () => {
      if (!uploadPromise) {
        return res.status(httpStatusCode.BAD_REQUEST).json({
          success: false,
          message: 'No image file found in the request'
        });
      }
      
      try {
        const imageKey = await uploadPromise;
        return res.status(httpStatusCode.OK).json({
          success: true,
          message: 'Image uploaded successfully',
          data: { imageKey }
        });
      } catch (error) {
        console.error('Upload error:', error);
        return formatErrorResponse(res, error);
      }
    });
    
    req.pipe(busboy);
  } catch (error) {
    console.error('Upload error:', error);
    return formatErrorResponse(res, error);
  }
};
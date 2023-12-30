/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { TGenericErrorResponse } from '../interface/error.interface';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);

  const extractedMessage = match && match[1];

  const statusCode = httpStatus.BAD_REQUEST;

  return {
    statusCode,
    message: 'Invalid ID',
    errorMessage: `${extractedMessage} is already exists`,
    errorDetails: err,
  };
};

export default handleDuplicateError;

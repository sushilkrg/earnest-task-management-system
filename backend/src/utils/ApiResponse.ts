export class ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: T, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  static success<T>(data: T, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  static created<T>(data: T, message = 'Created successfully') {
    return new ApiResponse(201, data, message);
  }
}

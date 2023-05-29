export class AuthTokenResponse {
  success: boolean;
  message: string;
  data: {
    payload: {
      id: string;
      user_type: string;
      roles: string[];
      level: string;
      group_id: string;
      merchant_id: string;
      store_id: string;
      iat: number;
      exp: number;
    };
  };
}

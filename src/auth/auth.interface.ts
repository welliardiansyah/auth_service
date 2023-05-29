export interface HttpRequest {
  phone: string;
  content?: string;
}

export interface HttpResponse {
  success: boolean;
  message: string;
  data: Record<string, any>;
}

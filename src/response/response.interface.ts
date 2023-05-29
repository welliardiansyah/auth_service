export interface RMessage {
  readonly value: string;
  readonly property: string;
  readonly constraint: string[];
}

export interface RSuccessMessage {
  readonly success: boolean;
  readonly message: string;
  readonly data?: Record<string, any> | Record<string, any>[];
}

export interface IResponse {
  readonly success: boolean;
  readonly message: string;
  readonly errors?: RMessage[];
  readonly data?: Record<string, any> | Record<string, any>[];
}

export interface IResponseError {
  readonly statusCode?: number;
  readonly message: RMessage[];
  readonly error?: string;
}

export interface IResponsePaging
  extends Omit<IResponse, 'success' | 'errors' | 'data'> {
  readonly totalData: number;
  readonly totalPage: number;
  readonly currentPage: number;
  readonly perPage: number;
  readonly data: Record<string, any> | Record<string, any>[];
}

export interface IListResponse {
  readonly total_item: number;
  readonly limit: number;
  readonly current_page: number;
  readonly items: Record<string, any>[];
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type IApplyDecorator = <TFunction extends Function, Y>(
  target: Record<string, any> | TFunction,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<Y>,
) => void;

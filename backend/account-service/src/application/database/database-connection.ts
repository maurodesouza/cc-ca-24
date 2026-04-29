export type DatabaseConnection = {
  query: (query: string, params: any[]) => Promise<any[]>;
  close: () => Promise<void>;
}



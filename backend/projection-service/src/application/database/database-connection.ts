export type DatabaseConnection = {
  connect(): Promise<void>;
  close(): Promise<void>;
}



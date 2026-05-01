import { inject } from "../utils/registry";
import { DatabaseConnection } from "../../application/database/database-connection";

export type Query = {
  where?: { [key: string]: any };
  select?: string[];
  order?: { [key: string]: "asc" | "desc" };
}

export class ORM {
  @inject("databaseConnection")
  private readonly connection!: DatabaseConnection;

  async save(model: Model): Promise<void> {
    const columns = model.columns.map(column => column.name).join(", ");
    const params = model.columns.map((_, index) => `$${index + 1}`).join(", ");
    const values = model.columns.map(column => model[column.property]);

    const query = `insert into ${model.schema}.${model.table} (${columns}) values (${params})`;

    await this.connection.query(query, values);
  }

  async update(model: Model) {
    const { updateColumns, whereColumns } = model.columns.reduce<{
      updateColumns: typeof model.columns;
      whereColumns: typeof model.columns;
    }>((acc, column) => {
      const key = column.primaryKey ? 'whereColumns' : 'updateColumns';
      acc[key].push(column);
      return acc;
    }, { updateColumns: [], whereColumns: [] });


    const setClause = updateColumns
      .map((column, index) => `${column.name} = $${index + 1}`)
      .join(", ");
    const setValues = updateColumns.map(column => model[column.property]);

    const whereConditions = whereColumns
      .map((column, index) =>
        `${column.name} = $${updateColumns.length + index + 1}`
      )
      .join(" and ");
    const whereValues = whereColumns.map(column => model[column.property]);

    const query = `update ${model.schema}.${model.table} set ${setClause} where ${whereConditions}`;

    await this.connection.query(query, [...setValues, ...whereValues]);
  }

  async deleteMany<T extends Model>(modelClass: new (...args: any[]) => T, query: Pick<Query, 'where'>) {
    const { where } = query;

    let whereClause = "";
    let values: any[] = [];

    if (where) {
      const conditions = Object.keys(where).map((key, index) => {
        values.push(where[key]);
        return `${key} = $${index + 1}`;
      });
      whereClause = `where ${conditions.join(" and ")}`;
    }

    const model = new modelClass();
    const sql = `delete from ${model.schema}.${model.table} ${whereClause}`;

    await this.connection.query(sql, values);
  }

  async findMany<T extends Model>(modelClass: new (...args: any[]) => T, query: Query): Promise<T[]> {
    const { where, select, order } = query;

    const modelInstance = new modelClass();
    const columns = select || modelInstance.columns.map(c => c.name);
    const selectClause = columns.join(", ");

    let whereClause = "";
    let values: any[] = [];

    if (where) {
      const conditions = Object.keys(where).map((key, index) => {
        values.push(where[key]);
        return `${key} = $${index + 1}`;
      });
      whereClause = `where ${conditions.join(" and ")}`;
    }

    let orderClause = "";
    if (order) {
      const orderConditions = Object.keys(order).map((key) => {
        const direction = order[key].toUpperCase() === "ASC" ? "ASC" : "DESC";
        return `${key} ${direction}`;
      });
      orderClause = `order by ${orderConditions.join(", ")}`;
    }

    const sql = `select ${selectClause} from ${modelInstance.schema}.${modelInstance.table} ${whereClause} ${orderClause}`;
    const result = await this.connection.query(sql, values);

    return result.map((row: any) => {
      const instance = new modelClass();

      modelInstance.columns.forEach((column) => {
        (instance as any)[column.property] = row[column.name];
      });

      return instance;
    });
  }

  async findOne<T extends Model>(modelClass: new (...args: any[]) => T, query: Query): Promise<T | undefined> {
    const { where, select, order } = query;

    const modelInstance = new modelClass();
    const columns = select || modelInstance.columns.map(c => c.name);
    const selectClause = columns.join(", ");

    let whereClause = "";
    let values: any[] = [];

    if (where) {
      const conditions = Object.keys(where).map((key, index) => {
        values.push(where[key]);
        return `${key} = $${index + 1}`;
      });
      whereClause = `where ${conditions.join(" and ")}`;
    }

    let orderClause = "";
    if (order) {
      const orderConditions = Object.keys(order).map(key => `${key} ${order[key]}`);
      orderClause = `order by ${orderConditions.join(", ")}`;
    }

    const sql = `select ${selectClause} from ${modelInstance.schema}.${modelInstance.table} ${whereClause} ${orderClause} limit 1`;
    const [result] = await this.connection.query(sql, values);

    if (!result) return;

    const instance = new modelClass()
    for (const column of modelInstance.columns) {
      if (result[column.name] !== undefined) {
        (instance as any)[column.property] = result[column.name];
      }
    }

    return instance;
  }

  async clear<T extends Model>(modelClass: new (...args: any[]) => T) {
    const model = new modelClass();
    await this.connection.query(`delete from ${model.schema}.${model.table}`, []);
  }
}

export class Model {
  shema!: string
  table!: string
  columns!: { name: string, property: string, primaryKey?: boolean }[]

  [property: string]: any
}

export function model(schema: string, table: string) {
  return function(target: any) {
    target.prototype.schema = schema
    target.prototype.table = table
  }
}

export function column(name: string, primaryKey?: boolean) {
  return function(target: any, propertyName: string) {
    target.columns = target.columns || []
    target.columns.push({ name, property: propertyName, primaryKey })
  }
}

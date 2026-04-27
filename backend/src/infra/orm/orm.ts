import { inject } from "../di/registry";
import { DatabaseConnection } from "../../application/database/database-connection";

export type Query = {
  where?: { [key: string]: any };
  select?: string[];
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


    const setColumns = updateColumns.map(column => column.name).join(", ");
    const setParams = updateColumns.map((_, index) => `$${index + 1}`).join(", ");
    const setValues = updateColumns.map(column => model[column.property]);

    const whereConditions = whereColumns
      .map((column, index) =>
        `${column.name} = $${updateColumns.length + index + 1}`
      )
      .join(" and ");
    const whereValues = whereColumns.map(column => model[column.property]);

    const query = `update ${model.schema}.${model.table} set ${setColumns} = ${setParams} where ${whereConditions}`;

    await this.connection.query(query, [...setValues, ...whereValues]);
  }

  async getUnique<T extends Model>(modelClass: new (...args: any[]) => T, query: Query): Promise<T | undefined> {
    const { where, select } = query;

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

    const sql = `select ${selectClause} from ${modelInstance.schema}.${modelInstance.table} ${whereClause} limit 1`;
    const [result] = await this.connection.query(sql, values);

    if (!result) return;

    const modelObj = new modelClass()
    for (const column of modelInstance.columns) {
      if (result[column.name] !== undefined) {
        (modelObj as any)[column.property] = result[column.name];
      }
    }

    return modelObj;
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

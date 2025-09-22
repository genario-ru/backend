import { getTableColumns, Table } from "drizzle-orm";

export const checkTableContainsProperty = (table: Table, property: string) => {
  const schemaColumns = getTableColumns(table);

  return schemaColumns.hasOwnProperty(property);
};

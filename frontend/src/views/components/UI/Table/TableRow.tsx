import TableCellView from "./TableCell";

import { Row } from "./";

export type TableRowProps = {
  onClick?: () => void
  items: Row;
  centeredColumns?: number[];
};

const TableRow = ({ items, centeredColumns, onClick }: TableRowProps) => (
  <tr className={onClick ? 'table__pointer' : ''} onClick={onClick}>
    { items.map((item, index) => (
      <TableCellView
        isCentered={centeredColumns && centeredColumns.includes(index)}
        key={item.type + index}
        {...item}
      />
    ))}
  </tr>
);

export default TableRow;

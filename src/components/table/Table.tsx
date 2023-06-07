import { twMerge } from "tailwind-merge";

export type Header = {
  name: string;
  className?: string;
  cellClassName?: string;
};

type Props<T> = {
  headers: Header[];
  items: T[];
  renderCell: (item: T, header: Header) => React.ReactNode;
};

export default function Table<T>({ headers, items, renderCell }: Props<T>) {
  return (
    <div className="-mx-4 sm:-mx-0 mt-4 md:mt-0">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr className="hidden md:table-row">
            {headers.map((header, i) => (
              <th
                key={i}
                scope="col"
                className={twMerge(
                  "py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900",
                  header.className
                )}
              >
                {header.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((item, i) => (
            <tr key={(item as any).id || i}>
              {headers.map((header, i) => (
                <td
                  key={i}
                  scope="col"
                  className={twMerge(
                    "py-4 pl-4 pr-3 text-sm font-medium text-gray-900",
                    header.className,
                    header.cellClassName
                  )}
                >
                  {renderCell(item, header)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const tableLinkStyle = "hover:underline text-blue-700 cursor-pointer";

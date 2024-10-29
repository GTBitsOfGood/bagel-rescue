type AnalyticsTableProps = {
  headers: string[];
  data: string[][];
  widths: number[];
};

function AnalyticsTable({ headers, data, widths }: AnalyticsTableProps) {
  return (
    <table className="compact-table">
      <thead>
        <tr>
          {headers.map((h, ind) => (
            <th key={h + ind}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr>
            {row.map((entry, ind) => (
              <td style={{ width: widths[ind] + "%" }}>{entry}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AnalyticsTable;

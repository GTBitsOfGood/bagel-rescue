function AnalyticsTable() {
  return (
    <table className="compact-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Apples</td>
          <td>$1.50</td>
          <td>50</td>
        </tr>
        <tr>
          <td>Bananas</td>
          <td>$0.75</td>
          <td>100</td>
        </tr>
        <tr>
          <td>Cherries</td>
          <td>$3.00</td>
          <td>25</td>
        </tr>
      </tbody>
    </table>
  );
}

export default AnalyticsTable;

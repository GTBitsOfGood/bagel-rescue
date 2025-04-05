import React, { useState } from 'react';

type Route = {
  name: string;
  date: string;
};

type RecentRoutesProps = {
  routes: Route[];
  itemsPerPage?: number;
};

function RecentRoutes({ routes, itemsPerPage = 15 }: RecentRoutesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(routes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, routes.length);
  const currentRoutes = routes.slice(startIndex, endIndex);
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Fill with empty rows if we have fewer than itemsPerPage items
  const emptyRowsCount = Math.max(0, itemsPerPage - currentRoutes.length);
  const emptyRows = Array.from({ length: emptyRowsCount }).map((_, index) => (
    <tr key={`empty-${index}`}>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
  ));
  
  return (
    <div className="analytics-card">
      <h2 className="section-title">Recent Routes</h2>
      
      <table className="routes-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {currentRoutes.map((route, index) => (
            <tr key={index}>
              <td>{route.name}</td>
              <td>{route.date}</td>
            </tr>
          ))}
          {emptyRows}
        </tbody>
      </table>
      
      <div className="pagination">
        <button 
          className="pagination-button" 
          onClick={goToPreviousPage} 
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          &lt;
        </button>
        <span className="pagination-info">
          {routes.length > 0 ? `${startIndex + 1} - ${endIndex} of ${routes.length}` : "0 - 0 of 0"}
        </span>
        <button 
          className="pagination-button" 
          onClick={goToNextPage} 
          disabled={currentPage === totalPages || routes.length === 0}
          aria-label="Next page"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default RecentRoutes;
import React from "react";
import styles from "../page.module.css";
import { PaginationProps } from "./types";

/**
 * A pagination component that displays a list of page numbers and allows
 * the user to navigate through a list of items.
 *
 * @param {number} total - The total number of items
 * @param {number} page - The current page number
 * @param {number} limit - The number of items per page
 * @param {number} totalPages - The total number of pages
 * @param {function(number): void} onPageChange - A callback function that is called
 * when the user navigates to a different page. The function takes the new page
 * number as an argument.
 *
 * @returns {JSX.Element} - The pagination component
 */
const Pagination: React.FC<PaginationProps> = ({
  total,
  page,
  limit,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={styles.paginationArrow}
      >
        &lt;
      </button>
      
      {pageNumbers.map(num => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`${styles.paginationButton} ${page === num ? styles.activePage : ''}`}
        >
          {num}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={styles.paginationArrow}
      >
        &gt;
      </button>
      
      <span className={styles.paginationInfo}>
        {page} - {totalPages} of {total}
      </span>
    </div>
  );
};

export default Pagination;
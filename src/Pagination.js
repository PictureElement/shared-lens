import { ReactComponent as PreviousIcon } from './icons/previous.svg';
import { ReactComponent as NextIcon } from './icons/next.svg';

function Pagination({ itemsPerPage, currentPage, numOfItems, onPageChange }) {
  const visiblePages = 3;
  const totalPages = Math.ceil(numOfItems / itemsPerPage);

  const handlePageChange = (page) => {
    onPageChange(page);
  };

  const generatePagination = () => {
    let pagination = [];
  
    // Calculate the start and end of the pagination range
    let start = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let end = Math.min(start + visiblePages - 1, totalPages);
  
    // Adjust the start if the end is at the total pages limit
    start = Math.max(1, end - visiblePages + 1);
  
    // Add the ellipsis before the start if necessary
    if (start > 1) {
      pagination.push(1);
      if (start > 2) {
        pagination.push('...');
      }
    }
  
    // Add the page numbers within the range
    for (let page = start; page <= end; page++) {
      pagination.push(page);
    }
  
    // Add the ellipsis after the end if necessary
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pagination.push('...');
      }
      pagination.push(totalPages);
    }
    
    // Map over array of page numbers and return an array of buttons
    return pagination.map((page, index) => {
      if (page === '...') {
        return (
          <button
            key={index}
            className="sl-pagination__control sl-pagination__control_ellipsis"
            disabled
            aria-label="Page ..."
            aria-disabled="true"
          >
            {page}
          </button>
        );
      } else {
        return (
          <button
            key={index}
            className={page === currentPage ? 'sl-pagination__control sl-pagination__control_active' : 'sl-pagination__control'}
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        );
      }
    });
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="sl-pagination">
      <div className="sl-pagination__container">
        <button
          className="sl-pagination__control sl-pagination__arrow sl-pagination__arrow_prev"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <PreviousIcon />
        </button>
        <div className="sl-pagination__numbers">
          {generatePagination()}
          <div className="sl-pagination__fraction">{currentPage}/{totalPages}</div>
        </div>
        <button
          className="sl-pagination__control sl-pagination__arrow sl-pagination__arrow_next"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <NextIcon />
        </button>
      </div>
    </div>
  )
}

export default Pagination;
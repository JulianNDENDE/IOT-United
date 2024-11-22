import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

const FilterButtons = ({ selectedFilter, onFilterChange }) => {
  const filters = ['all', 'room', 'weather'];

  return (
    <ButtonGroup className="mb-4">
      {filters.map((filter) => (
        <Button
          key={filter}
          variant={selectedFilter === filter ? 'primary' : 'outline-primary'}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default FilterButtons;

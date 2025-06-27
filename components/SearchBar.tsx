import React from 'react';
import SearchIcon from './icons/SearchIcon.tsx';
import { CustomerData } from '../types.ts';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  suggestions: CustomerData[];
  onSuggestionSelect: (customer: CustomerData) => void;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, suggestions, onSuggestionSelect, disabled }) => {
  
  return (
    <div className="relative w-full max-w-3xl">
      <div className="glass-card rounded-lg">
        <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-[var(--text-subtle)]" />
            </div>
            <input
              type="search"
              id="search-input"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              disabled={disabled}
              className="block w-full h-12 p-2 pl-12 text-md text-[var(--text-strong)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 placeholder:text-[var(--text-subtle)] disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="ค้นหาด้วยชื่อ หรือเบอร์โทรศัพท์..."
              aria-label="Search customer by name or phone number"
              autoComplete="off"
            />
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 glass-card rounded-lg p-2">
          <ul className="max-h-80 overflow-y-auto">
              {suggestions.map((customer) => (
                  <li key={customer.id} 
                      onClick={() => onSuggestionSelect(customer)}
                      className="px-4 py-3 cursor-pointer hover:bg-[var(--hover-bg)] rounded-lg flex justify-between items-center text-[var(--text-strong)]"
                  >
                      <div>
                        <p className="font-semibold">{customer.recipientName}</p>
                        <p className="text-sm text-[var(--text-subtle)]">{customer.phone}</p>
                      </div>
                  </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
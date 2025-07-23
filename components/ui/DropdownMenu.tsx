import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { MoreVertical } from './Icons';

interface DropdownMenuProps {
  children: ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        <MoreVertical size={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
          {React.Children.map(children, child => {
            if (!React.isValidElement<{ onClick?: () => void }>(child)) {
              return child;
            }

            const originalOnClick = child.props.onClick;

            return React.cloneElement(child, {
              onClick: () => {
                setIsOpen(false);
                if (originalOnClick) {
                  originalOnClick();
                }
              },
            });
          })}
        </div>
      )}
    </div>
  );
};

interface DropdownMenuItemProps {
    onClick?: () => void;
    children: ReactNode;
    className?: string;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
  >
    {children}
  </button>
);

export default DropdownMenu;
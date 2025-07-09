import * as React from "react";
import { Input } from "@shared/components/ui/input";
import { cn } from "@shared/lib/cn";
import { useAutocomplete } from "@shared/hooks/useAutocomplete";
import { Loader2, Search, User, Shuffle, Mail, Phone, Calendar } from "lucide-react";
import { InteractiveIcon, SuggestionMenu } from "@shared/components/ui/interactive-icon";
import { motion, AnimatePresence } from "motion/react";

interface AutocompleteInputProps extends React.ComponentProps<typeof Input> {
  fieldName: string;
  onValueChange?: (value: string) => void;
  onPatientSelect?: (idNumber: string) => void;
  minSearchLength?: number;
  iconRight?: React.ReactNode;
}

// Use React.memo to prevent unnecessary re-renders
export const AutocompleteInput = React.memo(React.forwardRef<
  HTMLInputElement,
  AutocompleteInputProps
>(({ className, fieldName, onValueChange, onPatientSelect, minSearchLength = 0, iconRight, ...props }, ref) => {
  const [inputValue, setInputValue] = React.useState(String(props.value || ""));
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [searchTerminated, setSearchTerminated] = React.useState(false);
  const [isAutofilled, setIsAutofilled] = React.useState(false);
  const [hasFocused, setHasFocused] = React.useState(false);
  const { suggestions, isLoading, getSuggestions, hasPreloadedData } = useAutocomplete(fieldName);
  const [isIconMenuOpen, setIsIconMenuOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSearchTermRef = React.useRef<string>('');

  // Combine refs
  React.useImperativeHandle(ref, () => inputRef.current!);

  // Sync with external value
  React.useEffect(() => {
    if (props.value !== inputValue) {
      const newValue = String(props.value || "");
      setInputValue(newValue);
      
      // If value changed externally (autofill), mark as autofilled
      if (newValue && newValue !== inputValue) {
        setIsAutofilled(true);
        setSearchTerminated(true);
        setShowSuggestions(false);
      } else if (!newValue) {
        setIsAutofilled(false);
        setSearchTerminated(false);
      }
    }
  }, [props.value, inputValue]);

  // Event listener to hide ALL suggestions when patient data is autofilled
  React.useEffect(() => {
    const handleHideAllAutocompleteSuggestions = () => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setSearchTerminated(true);
      setIsAutofilled(true);
    };

    window.addEventListener('hideAllAutocompleteSuggestions', handleHideAllAutocompleteSuggestions);

    return () => {
      window.removeEventListener('hideAllAutocompleteSuggestions', handleHideAllAutocompleteSuggestions);
    };
  }, []);

  // Debounced search effect - prevent infinite loops
  React.useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Don't search if terminated, autofilled, haven't focused, or no preloaded data
    if (searchTerminated || isAutofilled || !hasFocused || !hasPreloadedData) {
      return;
    }

    // Prevent duplicate searches
    if (lastSearchTermRef.current === inputValue) {
      return;
    }

    // Update last search term
    lastSearchTermRef.current = inputValue;

    // Search with debounce for typing, immediate for empty input
    debounceTimeoutRef.current = setTimeout(() => {
      getSuggestions(inputValue);
      setShowSuggestions(true);
    }, inputValue.length === 0 ? 0 : 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, getSuggestions, searchTerminated, isAutofilled, hasFocused, hasPreloadedData]);

  const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
    props.onBlur?.(e);
  }, [props.onBlur]);

  const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setHasFocused(true);
    
    // Show suggestions immediately on focus if not terminated and not autofilled
    if (!searchTerminated && !isAutofilled && hasPreloadedData) {
      // Reset last search term to force new search
      lastSearchTermRef.current = '';
      
      // Trigger search for suggestions (random if input is empty)
      setTimeout(() => {
        getSuggestions(inputValue);
        setShowSuggestions(true);
      }, 0);
    }
    props.onFocus?.(e);
  }, [getSuggestions, hasPreloadedData, inputValue, isAutofilled, props.onFocus, searchTerminated]);

  // Function to show suggestions when icon is clicked
  const handleIconClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Focus the input
    inputRef.current?.focus();
    
    // Only show suggestions if not terminated and not autofilled
    if (!searchTerminated && !isAutofilled && hasPreloadedData) {
      // Reset last search term to force new search
      lastSearchTermRef.current = '';
      
      // Trigger search for suggestions
      getSuggestions(inputValue);
      setShowSuggestions(true);
    }
  }, [getSuggestions, hasPreloadedData, inputValue, isAutofilled, searchTerminated]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);
    setSearchTerminated(false);
    setIsAutofilled(false); // Reset autofill when user types manually
    onValueChange?.(value);
    
    // Call original onChange if exists
    props.onChange?.(e);
  }, [props.onChange, onValueChange]);

  const handleSuggestionClick = React.useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSearchTerminated(true);
    setIsAutofilled(false); // Not autofill, manual selection
    lastSearchTermRef.current = suggestion; // Update last search term
    onValueChange?.(suggestion);
    
    // If it's ID number field, trigger patient selection silently
    if (fieldName === 'idNumber' && onPatientSelect) {
      setTimeout(() => {
        onPatientSelect(suggestion);
      }, 100);
    }
    
    // Create synthetic event for compatibility
    const syntheticEvent = {
      target: { value: suggestion }
    } as React.ChangeEvent<HTMLInputElement>;
    props.onChange?.(syntheticEvent);
    
    // Focus input after selection
    inputRef.current?.focus();
  }, [fieldName, onPatientSelect, onValueChange, props.onChange]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0 || searchTerminated || isAutofilled) {
      props.onKeyDown?.(e);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex].value);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setSearchTerminated(true);
        break;
      case 'Tab':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setSearchTerminated(true);
        props.onKeyDown?.(e);
        break;
      default:
        props.onKeyDown?.(e);
    }
  }, [showSuggestions, suggestions, selectedIndex, searchTerminated, isAutofilled, props.onKeyDown, handleSuggestionClick]);

  // Function to handle icon click
  const handleIconClickOld = React.useCallback(() => {
    // Show suggestions immediately on icon click
    if (!isIconMenuOpen && hasPreloadedData) {
      // Reset last search term to force new search
      lastSearchTermRef.current = '';
      
      // Trigger search for suggestions
      getSuggestions(inputValue);
      setIsIconMenuOpen(true);
    } else {
      setIsIconMenuOpen(false);
    }
  }, [getSuggestions, hasPreloadedData, inputValue, isIconMenuOpen]);

  // Handle suggestion selection from icon menu
  const handleSuggestionSelect = React.useCallback((suggestion: string) => {
    handleSuggestionClick(suggestion);
    setIsIconMenuOpen(false);
  }, [handleSuggestionClick]);

  // Determine the icon based on field and state - memoized to prevent unnecessary recalculations
  const getIcon = React.useMemo(() => {
    if (isLoading && !searchTerminated && !isAutofilled) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    
    if (fieldName === 'idNumber') {
      return <User className="h-4 w-4 text-muted-foreground" />;
    } else if (iconRight) {
      return iconRight;
    }
    
    if (showSuggestions && inputValue.length === 0 && !searchTerminated && !isAutofilled) {
      return <Shuffle className="h-4 w-4 text-muted-foreground" />;
    }
    
    if (hasFocused && !searchTerminated && !isAutofilled) {
      return <Search className="h-4 w-4 text-muted-foreground" />;
    }
    
    return null;
  }, [isLoading, searchTerminated, isAutofilled, fieldName, showSuggestions, inputValue, hasFocused, iconRight]);

  // Determine suggestion header text - memoized to prevent unnecessary recalculations
  const getSuggestionHeaderText = React.useMemo(() => {
    if (inputValue.length === 0) {
      return `${suggestions.length} sugerencia${suggestions.length !== 1 ? 's' : ''} aleatoria${suggestions.length !== 1 ? 's' : ''}`;
    }
    return `${suggestions.length} sugerencia${suggestions.length !== 1 ? 's' : ''} encontrada${suggestions.length !== 1 ? 's' : ''}`;
  }, [inputValue.length, suggestions.length]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          {...props}
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={cn(className)}
          autoComplete="off"
        />
        {(getIcon || iconRight) && (
          <div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-primary transition-colors"
            onClick={handleIconClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleIconClick(e as unknown as React.MouseEvent);
              }
            }}
          >
            {getIcon}
            {isIconMenuOpen && (
              <SuggestionMenu
                isOpen={isIconMenuOpen}
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                onClose={() => setIsIconMenuOpen(false)}
                fieldName={fieldName}
              />
            )}
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && !searchTerminated && !isAutofilled && (
        <div
          ref={suggestionsRef}
          className="absolute z-[9999] w-full mt-1 bg-white dark:bg-background border border-gray-200 dark:border-gray-700 rounded-md shadow-xl max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        >
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            {fieldName === 'idNumber' && <User className="h-3 w-3" />}
            {inputValue.length === 0 && <Shuffle className="h-3 w-3" />}
            {getSuggestionHeaderText}
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.value}-${index}`}
              className={cn(
                "px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 flex justify-between items-center transition-colors",
                selectedIndex === index && "bg-blue-100 dark:bg-blue-900/30",
                fieldName === 'idNumber' && "hover:bg-green-50 dark:hover:bg-green-900/20"
              )}
              onClick={() => handleSuggestionClick(suggestion.value)}
            >
              <span className="text-sm text-gray-900 dark:text-gray-100 flex-1 truncate flex items-center gap-2">
                {fieldName === 'idNumber' && <User className="h-3 w-3 text-green-600 dark:text-green-400" />}
                {suggestion.value}
              </span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0",
                fieldName === 'idNumber' 
                  ? "text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-900/30" 
                  : "text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700"
              )}>
                {suggestion.count}
              </span>
            </div>
          ))}
          <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {inputValue.length === 0 
              ? "Sugerencias aleatorias - Escribe para filtrar" 
              : "Usa ↑↓ para navegar, Enter para seleccionar"
            }
          </div>
        </div>
      )}
    </div>
  );
}));

AutocompleteInput.displayName = "AutocompleteInput";
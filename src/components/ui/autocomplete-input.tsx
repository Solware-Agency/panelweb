import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { Loader2, Search, User } from "lucide-react";

interface AutocompleteInputProps extends React.ComponentProps<typeof Input> {
  fieldName: string;
  onValueChange?: (value: string) => void;
  onPatientSelect?: (idNumber: string) => void;
  minSearchLength?: number;
}

export const AutocompleteInput = React.forwardRef<
  HTMLInputElement,
  AutocompleteInputProps
>(({ className, fieldName, onValueChange, onPatientSelect, minSearchLength = 2, ...props }, ref) => {
  const [inputValue, setInputValue] = React.useState(String(props.value || ""));
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [searchTerminated, setSearchTerminated] = React.useState(false);
  const [isAutofilled, setIsAutofilled] = React.useState(false);
  const { suggestions, isLoading, getSuggestions } = useAutocomplete(fieldName, minSearchLength);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Combinar refs
  React.useImperativeHandle(ref, () => inputRef.current!);

  // Sincronizar con el valor externo
  React.useEffect(() => {
    if (props.value !== inputValue) {
      const newValue = String(props.value || "");
      setInputValue(newValue);
      
      // Si el valor cambió externamente (autofill), marcar como autofilled
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

  // Event listener para ocultar TODAS las sugerencias cuando se autollenan datos del paciente
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

  // Debounce mejorado para las búsquedas
  React.useEffect(() => {
    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // No buscar si la búsqueda ya terminó, si el input está vacío, o si fue autofilled
    if (searchTerminated || inputValue.length === 0 || isAutofilled) {
      setShowSuggestions(false);
      return;
    }

    // Solo buscar si cumple con la longitud mínima
    if (inputValue.length >= minSearchLength) {
      debounceTimeoutRef.current = setTimeout(() => {
        getSuggestions(inputValue);
        setShowSuggestions(true);
      }, 300);
    } else {
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, minSearchLength, getSuggestions, searchTerminated, isAutofilled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);
    setSearchTerminated(false);
    setIsAutofilled(false); // Resetear autofill cuando el usuario escribe manualmente
    onValueChange?.(value);
    
    // Llamar al onChange original si existe
    props.onChange?.(e);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSearchTerminated(true);
    setIsAutofilled(false); // No es autofill, es selección manual
    onValueChange?.(suggestion);
    
    // Si es el campo de cédula, disparar el evento de selección de paciente de forma silenciosa
    if (fieldName === 'idNumber' && onPatientSelect) {
      setTimeout(() => {
        onPatientSelect(suggestion);
      }, 100);
    }
    
    // Crear evento sintético para mantener compatibilidad
    const syntheticEvent = {
      target: { value: suggestion }
    } as React.ChangeEvent<HTMLInputElement>;
    props.onChange?.(syntheticEvent);
    
    // Enfocar el input después de seleccionar
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
    props.onBlur?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Solo mostrar sugerencias si la búsqueda no ha terminado, hay sugerencias, y no fue autofilled
    if (!searchTerminated && !isAutofilled && inputValue.length >= minSearchLength && suggestions.length > 0) {
      setShowSuggestions(true);
    }
    props.onFocus?.(e);
  };

  // Determinar el icono según el campo
  const getIcon = () => {
    if (isLoading && !searchTerminated && !isAutofilled) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    
    if (fieldName === 'idNumber') {
      return <User className="h-4 w-4 text-muted-foreground" />;
    }
    
    if (inputValue.length >= minSearchLength && !searchTerminated && !isAutofilled) {
      return <Search className="h-4 w-4 text-muted-foreground" />;
    }
    
    return null;
  };

  return (
    <div className="relative">
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
        {getIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getIcon()}
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && !searchTerminated && !isAutofilled && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b flex items-center gap-2">
            {fieldName === 'idNumber' && <User className="h-3 w-3" />}
            {suggestions.length} sugerencia{suggestions.length !== 1 ? 's' : ''} encontrada{suggestions.length !== 1 ? 's' : ''}
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.value}-${index}`}
              className={cn(
                "px-3 py-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center transition-colors",
                selectedIndex === index && "bg-blue-100",
                fieldName === 'idNumber' && "hover:bg-green-50"
              )}
              onClick={() => handleSuggestionClick(suggestion.value)}
            >
              <span className="text-sm text-gray-900 flex-1 truncate flex items-center gap-2">
                {fieldName === 'idNumber' && <User className="h-3 w-3 text-green-600" />}
                {suggestion.value}
              </span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0",
                fieldName === 'idNumber' 
                  ? "text-green-700 bg-green-200" 
                  : "text-gray-500 bg-gray-200"
              )}>
                {suggestion.count}
              </span>
            </div>
          ))}
          <div className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-t">
            Usa ↑↓ para navegar, Enter para seleccionar
          </div>
        </div>
      )}
    </div>
  );
});

AutocompleteInput.displayName = "AutocompleteInput";
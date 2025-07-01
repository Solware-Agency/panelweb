import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, File } from 'lucide-react';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@lib/supabase/config';
import { useToast } from '@shared/hooks/use-toast';

const GenerateCaseButton: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Query for fetching biopsia cases
  const handleButtonClick = () => {
    // Navigate directly to the case selection page
    navigate('/cases-selection');
  };

  return (
    <button
      onClick={handleButtonClick}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
    >
      Generar Caso
    </button>
  );
};

export default GenerateCaseButton;
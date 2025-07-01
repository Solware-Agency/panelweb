import React from 'react';
import { useNavigate } from 'react-router-dom';

const GenerateCaseButton: React.FC = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
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
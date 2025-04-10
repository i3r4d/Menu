
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackButton = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className="fixed bottom-4 left-4 bg-white/80 shadow-md backdrop-blur-sm rounded-full h-10 w-10 z-10"
    >
      <ArrowLeft size={18} />
    </Button>
  );
};

export default BackButton;

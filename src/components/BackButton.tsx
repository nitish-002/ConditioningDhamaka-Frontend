import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  path?: string;
}

export default function BackButton({ path }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (path) {
      navigate(path);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
    >
      <ChevronLeft size={20} />
      <span>Back</span>
    </button>
  );
}

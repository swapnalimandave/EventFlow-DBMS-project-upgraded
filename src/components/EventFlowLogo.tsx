import logo from '../assets/logo.png';

interface EventFlowLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'white';
}

export const EventFlowLogo = ({
  className = '',
  size = 'md',
}: EventFlowLogoProps) => {
  const heights = {
    xs: 30,
    sm: 40,
    md: 60,
    lg: 70,
    xl: 80,
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={logo}
        alt="Logo"
        style={{
          height: `${heights[size]}px`,
          width: 'auto',
        }}
      />
    </div>
  );
};
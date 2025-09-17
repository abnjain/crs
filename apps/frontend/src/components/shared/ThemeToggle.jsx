// src/components/shared/ThemeToggle.jsx
import { Moon, Sun, SunMoon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const icon =
    theme === 'light' ? (
      <Sun className="h-[1.2rem] w-[1.2rem]" />
    ) : theme === 'dark' ? (
      <Moon className="h-[1.2rem] w-[1.2rem]" />
    ) : (
      <SunMoon className="h-[1.2rem] w-[1.2rem]" />
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === 'light'
          ? 'Light Theme'
          : theme === 'dark'
          ? 'Dark Theme'
          : 'System Theme'}
      </TooltipContent>
    </Tooltip>
  );
}

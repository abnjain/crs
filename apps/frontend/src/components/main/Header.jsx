

// Header Component
const Header = ({ onMenuClick, theme, toggleTheme }) => {
  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <button 
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search..." 
            className="pl-8"
          />
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleTheme}
      >
        <ThemeIcon className="h-5 w-5" />
      </Button>
    </header>
  );
};

export default Header;
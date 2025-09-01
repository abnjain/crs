export default function Home() {
  // Theme state and effect
  const [theme, setTheme] = useState('system');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Effect to apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Determine theme
    const resolvedTheme = theme === 'system' ? 
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' : 
      theme;
    
    // Apply theme
    root.classList.add(resolvedTheme);
  }, [theme]);
  
  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };
  
  // Close sidebar on route change
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };
  
  // Close sidebar when clicking overlay
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    // In a real app, you would check authentication here
    // For demo purposes, we're assuming the user is authenticated
    return children;
  };
  
  // Get current component based on active section
  const getCurrentComponent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'staff': return <Staff />;
      case 'library': return <Library />;
      case 'attendance': return <Attendance />;
      case 'placements': return <Placements />;
      case 'notices': return <Notices />;
      case 'documents': return <Documents />;
      case 'setting': return <Setting />;
      default: return <Dashboard />;
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <div className="flex h-screen bg-background text-foreground">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={closeSidebar} 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
              theme={theme} 
              toggleTheme={toggleTheme}
            />
            
            {/* Page Content */}
            <main className="flex-1 overflow-auto p-6">
              <ProtectedRoute>
                {getCurrentComponent()}
              </ProtectedRoute>
            </main>
          </div>
        </div>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
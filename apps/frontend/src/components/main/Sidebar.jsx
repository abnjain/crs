
// Sidebar Component
const Sidebar = ({ isOpen, onClose, activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'staff', label: 'Staff & Teachers', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'placements', label: 'Placements', icon: Briefcase },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'setting', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-background border-r transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">College Central</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeSection === item.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => {
              // Logout functionality would go here
              console.log('Logout');
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
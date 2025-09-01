// Settings Component
const Settings = () => {
  const [profile] = useState({
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'System Administrator',
    institution: 'ABC College of Engineering'
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage system settings and preferences</p>
      </div>
      
      <Card>
        <Card.Header>
          <Card.Title>Profile Information</Card.Title>
          <Card.Description>Update your profile details and contact information</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={profile.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={profile.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={profile.role} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" defaultValue={profile.institution} disabled />
            </div>
          </div>
        </Card.Content>
        <Card.Footer>
          <Button>Save Changes</Button>
        </Card.Footer>
      </Card>
      
      <Card>
        <Card.Header>
          <Card.Title>System Preferences</Card.Title>
          <Card.Description>Configure system-wide settings</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Enable Notifications</div>
                <div className="text-sm text-muted-foreground">Receive email notifications for system updates</div>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-save Settings</div>
                <div className="text-sm text-muted-foreground">Automatically save your preferences</div>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-factor Authentication</div>
                <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Settings;

// Staff Component
const Staff = () => {
  const [staff] = useState([
    { id: 1, name: 'Dr. Alice Johnson', role: 'Professor', department: 'Computer Science', email: 'alice.j@college.edu', phone: '+1-234-567-8901' },
    { id: 2, name: 'Prof. Robert Smith', role: 'Associate Professor', department: 'Mechanical Engineering', email: 'robert.s@college.edu', phone: '+1-234-567-8902' },
    { id: 3, name: 'Dr. Sarah Williams', role: 'Assistant Professor', department: 'Electrical Engineering', email: 'sarah.w@college.edu', phone: '+1-234-567-8903' },
    { id: 4, name: 'Mr. David Brown', role: 'Lecturer', department: 'Civil Engineering', email: 'david.b@college.edu', phone: '+1-234-567-8904' },
    { id: 5, name: 'Ms. Emily Davis', role: 'Lab Technician', department: 'Computer Science', email: 'emily.d@college.edu', phone: '+1-234-567-8905' }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff and teacher records</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search staff..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Card>
        <Card.Content>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Role</Table.Head>
                <Table.Head>Department</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Phone</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredStaff.map((member) => (
                <Table.Row key={member.id}>
                  <Table.Cell className="font-medium">{member.name}</Table.Cell>
                  <Table.Cell>{member.role}</Table.Cell>
                  <Table.Cell>{member.department}</Table.Cell>
                  <Table.Cell>{member.email}</Table.Cell>
                  <Table.Cell>{member.phone}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
      
      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Add New Staff Member</Dialog.Title>
            <Dialog.Description>
              Enter the staff details to add them to the system.
            </Dialog.Description>
          </Dialog.Header>
          <form className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter staff name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select id="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select role</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Administrative Staff">Administrative Staff</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <select id="department" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select department</option>
                  <option value="CS">Computer Science</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="EC">Electronics & Communication</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="Enter phone number" required />
              </div>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Staff</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default Staff;
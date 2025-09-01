
// Students Component
const Students = () => {
  const [students] = useState([
    { id: 1, name: 'John Doe', rollNo: 'CS2023001', department: 'Computer Science', year: '3rd', email: 'john.doe@college.edu' },
    { id: 2, name: 'Jane Smith', rollNo: 'CS2023002', department: 'Computer Science', year: '3rd', email: 'jane.smith@college.edu' },
    { id: 3, name: 'Robert Johnson', rollNo: 'ME2023001', department: 'Mechanical Engineering', year: '2nd', email: 'robert.j@college.edu' },
    { id: 4, name: 'Emily Davis', rollNo: 'EE2023001', department: 'Electrical Engineering', year: '4th', email: 'emily.d@college.edu' },
    { id: 5, name: 'Michael Brown', rollNo: 'CE2023001', department: 'Civil Engineering', year: '1st', email: 'michael.b@college.edu' }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
          <p className="text-muted-foreground">Manage student records and information</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search students..." 
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
                <Table.Head>Roll No</Table.Head>
                <Table.Head>Department</Table.Head>
                <Table.Head>Year</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredStudents.map((student) => (
                <Table.Row key={student.id}>
                  <Table.Cell className="font-medium">{student.name}</Table.Cell>
                  <Table.Cell>{student.rollNo}</Table.Cell>
                  <Table.Cell>{student.department}</Table.Cell>
                  <Table.Cell>{student.year}</Table.Cell>
                  <Table.Cell>{student.email}</Table.Cell>
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
      
      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Add New Student</Dialog.Title>
            <Dialog.Description>
              Enter the student details to add them to the system.
            </Dialog.Description>
          </Dialog.Header>
          <form className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter student name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input id="rollNo" placeholder="Enter roll number" required />
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
                <Label htmlFor="year">Year</Label>
                <select id="year" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select year</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" required />
              </div>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Student</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default Students;
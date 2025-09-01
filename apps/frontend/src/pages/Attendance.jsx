
// Attendance Component
const Attendance = () => {
  const [attendanceRecords] = useState([
    { id: 1, student: 'John Doe', course: 'Data Structures', date: '2023-12-01', status: 'Present' },
    { id: 2, student: 'Jane Smith', course: 'Data Structures', date: '2023-12-01', status: 'Present' },
    { id: 3, student: 'Robert Johnson', course: 'Data Structures', date: '2023-12-01', status: 'Absent' },
    { id: 4, student: 'Emily Davis', course: 'Data Structures', date: '2023-12-01', status: 'Present' },
    { id: 5, student: 'Michael Brown', course: 'Data Structures', date: '2023-12-01', status: 'Present' }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2023-12-01');
  const [selectedCourse, setSelectedCourse] = useState('Data Structures');
  
  const filteredRecords = attendanceRecords.filter(record => 
    record.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.course.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
        <p className="text-muted-foreground">Manage student attendance records</p>
      </div>
      
      <Card>
        <Card.Header>
          <Card.Title>Attendance Records</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="course">Course</Label>
              <select 
                id="course" 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Data Structures">Data Structures</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Operating Systems">Operating Systems</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Student</Table.Head>
                <Table.Head>Course</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredRecords.map((record) => (
                <Table.Row key={record.id}>
                  <Table.Cell className="font-medium">{record.student}</Table.Cell>
                  <Table.Cell>{record.course}</Table.Cell>
                  <Table.Cell>{record.date}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                      {record.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Attendance;
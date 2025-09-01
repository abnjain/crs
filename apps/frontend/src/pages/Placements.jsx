
// Placements Component
const Placements = () => {
  const [placements] = useState([
    { id: 1, student: 'John Doe', company: 'TechCorp Inc.', position: 'Software Engineer', package: '$75,000', date: '2023-11-15' },
    { id: 2, student: 'Jane Smith', company: 'Innovate Solutions', position: 'Data Analyst', package: '$65,000', date: '2023-11-10' },
    { id: 3, student: 'Robert Johnson', company: 'Global Systems', position: 'Mechanical Engineer', package: '$60,000', date: '2023-11-08' },
    { id: 4, student: 'Emily Davis', company: 'PowerGrid Ltd.', position: 'Electrical Engineer', package: '$58,000', date: '2023-11-05' }
  ]);
  
  const [stats] = useState({
    totalPlacements: 142,
    placementRate: 89,
    avgPackage: '$67,500',
    topCompany: 'TechCorp Inc.'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const filteredPlacements = placements.filter(placement => 
    placement.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    placement.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Placement Management</h2>
          <p className="text-muted-foreground">Manage student job placements and allocations</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Placement
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Card.Header>
            <Card.Title>Total Placements</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">{stats.totalPlacements}</div>
            <p className="text-sm text-muted-foreground">This year</p>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Placement Rate</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">{stats.placementRate}%</div>
            <p className="text-sm text-muted-foreground">Of eligible students</p>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Avg. Package</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">{stats.avgPackage}</div>
            <p className="text-sm text-muted-foreground">Per annum</p>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Top Company</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">{stats.topCompany}</div>
            <p className="text-sm text-muted-foreground">Hired 12 students</p>
          </Card.Content>
        </Card>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search placements..." 
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
                <Table.Head>Student</Table.Head>
                <Table.Head>Company</Table.Head>
                <Table.Head>Position</Table.Head>
                <Table.Head>Package</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredPlacements.map((placement) => (
                <Table.Row key={placement.id}>
                  <Table.Cell className="font-medium">{placement.student}</Table.Cell>
                  <Table.Cell>{placement.company}</Table.Cell>
                  <Table.Cell>{placement.position}</Table.Cell>
                  <Table.Cell>{placement.package}</Table.Cell>
                  <Table.Cell>{placement.date}</Table.Cell>
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
      
      {/* Add Placement Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Add New Placement</Dialog.Title>
            <Dialog.Description>
              Enter the placement details to record a new job allocation.
            </Dialog.Description>
          </Dialog.Header>
          <form className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="student">Student</Label>
                <select id="student" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select student</option>
                  <option value="1">John Doe (CS2023001)</option>
                  <option value="2">Jane Smith (CS2023002)</option>
                  <option value="3">Robert Johnson (ME2023001)</option>
                  <option value="4">Emily Davis (EE2023001)</option>
                  <option value="5">Michael Brown (CE2023001)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Enter company name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Enter job position" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="package">Package</Label>
                <Input id="package" placeholder="Enter compensation package" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required />
              </div>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Placement</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default Placements;
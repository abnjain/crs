// Documents Component
const Documents = () => {
  const [documents] = useState([
    { id: 1, title: 'Course Syllabus - Data Structures', category: 'Academic', uploadedBy: 'Dr. Alice Johnson', date: '2023-11-20', size: '2.4 MB', type: 'PDF' },
    { id: 2, title: 'Lab Manual - Electrical Circuits', category: 'Laboratory', uploadedBy: 'Prof. Robert Smith', date: '2023-11-18', size: '4.1 MB', type: 'PDF' },
    { id: 3, title: 'Research Paper - AI Applications', category: 'Research', uploadedBy: 'Dr. Sarah Williams', date: '2023-11-15', size: '1.8 MB', type: 'PDF' },
    { id: 4, title: 'Student Handbook 2023', category: 'Administrative', uploadedBy: 'Admin Office', date: '2023-11-10', size: '3.2 MB', type: 'PDF' },
    { id: 5, title: 'Placement Brochure', category: 'Placements', uploadedBy: 'Placement Cell', date: '2023-11-05', size: '5.6 MB', type: 'PDF' }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Academic', 'Laboratory', 'Research', 'Administrative', 'Placements'];
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
        <p className="text-muted-foreground">Manage study materials and important documents</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search documents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-full md:w-48">
          <Label htmlFor="category">Category</Label>
          <select 
            id="category" 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      <Card>
        <Card.Content>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Title</Table.Head>
                <Table.Head>Category</Table.Head>
                <Table.Head>Uploaded By</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Size</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredDocuments.map((doc) => (
                <Table.Row key={doc.id}>
                  <Table.Cell className="font-medium">{doc.title}</Table.Cell>
                  <Table.Cell>{doc.category}</Table.Cell>
                  <Table.Cell>{doc.uploadedBy}</Table.Cell>
                  <Table.Cell>{doc.date}</Table.Cell>
                  <Table.Cell>{doc.size}</Table.Cell>
                  <Table.Cell>
                    <Badge variant="secondary">{doc.type}</Badge>
                  </Table.Cell>
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
    </div>
  );
};

export default Documents;
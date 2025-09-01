
// Library Component
const Library = () => {
  const [books] = useState([
    { id: 1, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', available: 5, total: 8 },
    { id: 2, title: 'Engineering Mechanics', author: 'R.C. Hibbeler', isbn: '978-0133918922', category: 'Mechanical Engineering', available: 3, total: 5 },
    { id: 3, title: 'Electric Circuits', author: 'James W. Nilsson', isbn: '978-0133760033', category: 'Electrical Engineering', available: 7, total: 7 },
    { id: 4, title: 'Structural Analysis', author: 'R.C. Hibbeler', isbn: '978-0134610672', category: 'Civil Engineering', available: 2, total: 4 },
    { id: 5, title: 'Digital Communications', author: 'John G. Proakis', isbn: '978-0072957167', category: 'Electronics & Communication', available: 4, total: 6 }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Library Management</h2>
          <p className="text-muted-foreground">Manage library books and resources</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search books..." 
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
                <Table.Head>Title</Table.Head>
                <Table.Head>Author</Table.Head>
                <Table.Head>ISBN</Table.Head>
                <Table.Head>Category</Table.Head>
                <Table.Head>Availability</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredBooks.map((book) => (
                <Table.Row key={book.id}>
                  <Table.Cell className="font-medium">{book.title}</Table.Cell>
                  <Table.Cell>{book.author}</Table.Cell>
                  <Table.Cell>{book.isbn}</Table.Cell>
                  <Table.Cell>{book.category}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={book.available > 0 ? 'default' : 'destructive'}>
                      {book.available}/{book.total} available
                    </Badge>
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
      
      {/* Add Book Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Add New Book</Dialog.Title>
            <Dialog.Description>
              Enter the book details to add it to the library.
            </Dialog.Description>
          </Dialog.Header>
          <form className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter book title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" placeholder="Enter author name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" placeholder="Enter ISBN number" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select category</option>
                  <option value="CS">Computer Science</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="EC">Electronics & Communication</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total">Total Copies</Label>
                <Input id="total" type="number" placeholder="Enter total number of copies" required />
              </div>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Book</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default Library;
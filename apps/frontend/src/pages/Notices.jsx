
// Notices Component
const Notices = () => {
  const [notices] = useState([
    { id: 1, title: 'Semester Exams Schedule', content: 'The semester exams will be conducted from December 15th to December 30th...', category: 'Academic', status: 'Published', date: '2023-12-01', author: 'Dr. Alice Johnson' },
    { id: 2, title: 'Library Holiday Notice', content: 'The library will remain closed on December 25th and 26th due to Christmas holidays...', category: 'Library', status: 'Published', date: '2023-11-28', author: 'Mr. David Brown' },
    { id: 3, title: 'Placement Drive Registration', content: 'Registration for the upcoming placement drive is now open. All final year students must register by December 10th...', category: 'Placements', status: 'Draft', date: '2023-11-25', author: 'Prof. Robert Smith' }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  
  const filteredNotices = notices.filter(notice => 
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleViewNotice = (notice) => {
    setSelectedNotice(notice);
    setIsViewDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notice Board</h2>
          <p className="text-muted-foreground">Manage college notices and announcements</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Notice
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search notices..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotices.map((notice) => (
          <Card key={notice.id} className="flex flex-col h-full">
            <Card.Header>
              <div className="flex justify-between items-start">
                <Card.Title className="text-lg">{notice.title}</Card.Title>
                <Badge variant={notice.status === 'Published' ? 'default' : 'secondary'}>
                  {notice.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {notice.category} • {notice.date}
              </div>
            </Card.Header>
            <Card.Content className="flex-grow">
              <p className="text-sm line-clamp-3">{notice.content}</p>
            </Card.Content>
            <Card.Footer>
              <div className="flex justify-between items-center w-full">
                <span className="text-xs text-muted-foreground">By {notice.author}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleViewNotice(notice)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card.Footer>
          </Card>
        ))}
      </div>
      
      {/* View Notice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedNotice && (
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{selectedNotice.title}</Dialog.Title>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedNotice.category} • {selectedNotice.date}
                </span>
                <Badge variant={selectedNotice.status === 'Published' ? 'default' : 'secondary'}>
                  {selectedNotice.status}
                </Badge>
              </div>
            </Dialog.Header>
            <div className="py-4">
              <p className="whitespace-pre-wrap">{selectedNotice.content}</p>
              <div className="mt-4 text-sm text-muted-foreground">
                Posted by {selectedNotice.author}
              </div>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        )}
      </Dialog>
      
      {/* Add Notice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Add New Notice</Dialog.Title>
            <Dialog.Description>
              Create a new notice or announcement for the college.
            </Dialog.Description>
          </Dialog.Header>
          <form className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter notice title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select category</option>
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Library">Library</option>
                  <option value="Placements">Placements</option>
                  <option value="Events">Events</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <textarea 
                  id="content"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter notice content..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="Draft">Save as Draft</option>
                  <option value="Published">Publish Immediately</option>
                </select>
              </div>
            </div>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Notice</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default Notices;
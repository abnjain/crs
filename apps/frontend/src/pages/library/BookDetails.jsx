import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Users, Calendar } from 'lucide-react';
import libraryService from '@/services/libraryService';
import { toast } from 'react-hot-toast';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const books = await libraryService.searchBooks();
        const found = books.find(b => b._id === id);
        if (!found) {
          toast.error("Book not found");
          navigate('/library/teacher');
          return;
        }
        setBook(found);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load book");
        navigate('/library/teacher');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{book.title}</CardTitle>
          <CardDescription>by {book.author}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Book Details</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>Subject:</strong> {book.subject}</li>
                <li><strong>ISBN:</strong> {book.isbn || 'N/A'}</li>
                <li><strong>Publisher:</strong> {book.publisher || 'N/A'}</li>
                <li><strong>Year:</strong> {book.year || 'N/A'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Availability</h4>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span>{book.availableCopies} of {book.totalCopies} copies available</span>
              </div>
              {book.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-destructive">Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground">{book.description || 'No description available.'}</p>
          </div>

          {/* Teacher cannot issue/return — so we show info only */}
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm">
              <strong>Note:</strong> Teachers can view book details and availability. 
              To borrow or return books, please visit the library desk or contact the librarian.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
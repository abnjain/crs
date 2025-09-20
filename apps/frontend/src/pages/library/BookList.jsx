import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users } from 'lucide-react';

export default function BookList({ books, onViewDetail }) {
  if (!books || books.length === 0) {
    return (
      <div className="text-center py-10">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No books found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <Card key={book._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-1">by {book.author}</p>
            <p className="text-xs text-muted-foreground mb-2">{book.subject}</p>
            <div className="flex items-center gap-2 text-xs">
              <Users className="h-3 w-3" />
              <span>{book.availableCopies} / {book.totalCopies} available</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onViewDetail(book._id)}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
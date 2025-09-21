import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookGrid = ({ books = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No books found</h3>
        <p className="text-muted-foreground">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <Card key={book._id} className="hover:shadow-md transition-shadow">
          <Link to={`/library/books/${book._id}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {book.authors?.join(', ') || 'Unknown Author'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {book.subjects?.slice(0, 2).map((subject, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                  {book.subjects?.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{book.subjects.length - 2}
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm">
                  <p className="text-muted-foreground">Publisher: {book.publisher || 'N/A'}</p>
                  <p className="text-muted-foreground">Year: {book.year || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2">
              <div className="flex items-center text-sm">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className={book.copiesAvailable > 0 ? 'text-green-600' : 'text-red-600'}>
                  {book.copiesAvailable} available
                </span>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default BookGrid;
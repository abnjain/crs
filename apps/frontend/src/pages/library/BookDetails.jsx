// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ArrowLeft, BookOpen, Users, Calendar } from 'lucide-react';
// import libraryService from '@/services/libraryService';
// import toast from "react-hot-toast";

// export default function BookDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [book, setBook] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchBook = async () => {
//       try {
//         const books = await libraryService.searchBooks();
//         const found = books.find(b => b._id === id);
//         if (!found) {
//           toast.error("Book not found");
//           navigate('/library/teacher');
//           return;
//         }
//         setBook(found);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load book");
//         navigate('/library/teacher');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchBook();
//   }, [id, navigate]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!book) return null;

//   return (
//     <>
//     <div className="space-y-6">
//       <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
//         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
//       </Button>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">{book.title}</CardTitle>
//           <CardDescription>by {book.author}</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h4 className="font-semibold mb-2">Book Details</h4>
//               <ul className="space-y-1 text-sm">
//                 <li><strong>Subject:</strong> {book.subject}</li>
//                 <li><strong>ISBN:</strong> {book.isbn || 'N/A'}</li>
//                 <li><strong>Publisher:</strong> {book.publisher || 'N/A'}</li>
//                 <li><strong>Year:</strong> {book.year || 'N/A'}</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-2">Availability</h4>
//               <div className="flex items-center gap-2 mb-2">
//                 <Users className="h-4 w-4" />
//                 <span>{book.availableCopies} of {book.totalCopies} copies available</span>
//               </div>
//               {book.dueDate && (
//                 <div className="flex items-center gap-2">
//                   <Calendar className="h-4 w-4" />
//                   <span className="text-destructive">Due: {new Date(book.dueDate).toLocaleDateString()}</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div>
//             <h4 className="font-semibold mb-2">Description</h4>
//             <p className="text-muted-foreground">{book.description || 'No description available.'}</p>
//           </div>

//           {/* Teacher cannot issue/return — so we show info only */}
//           <div className="bg-muted p-4 rounded-md">
//             <p className="text-sm">
//               <strong>Note:</strong> Teachers can view book details and availability. 
//               To borrow or return books, please visit the library desk or contact the librarian.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   </>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/config/api';
import { Book, Clock, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from "react-hot-toast";
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/library/books/${id}`);
      toast.success(res.data.message ||"Books loaded!!");
      setBook(res.data);
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueBook = async () => {
    try {
      const res = await api.post(`/library/books/${id}/issue`, {
        userId: user?._id
      });
      setIsIssueDialogOpen(false);
      setIsConfirmDialogOpen(true);
      setActionType('issue');
      fetchBookDetails(); // Refresh book data
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  const handleReturnBook = async () => {
    try {
      const res = await api.post(`/library/books/${id}/return`, {
        userId: user?._id
      });
      setIsReturnDialogOpen(false);
      setIsConfirmDialogOpen(true);
      setActionType('return');
      fetchBookDetails(); // Refresh book data
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Book not found</h2>
        <Button onClick={() => navigate('/library')}>Back to Library</Button>
      </div>
    );
  }

  const canIssue = book.copiesAvailable > 0;
  const userRole = user?.roles?.[0] || '';

  return (
    <>
      <div className="p-4 md:p-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{book.title}</CardTitle>
                <CardDescription>
                  by {book.authors?.join(', ') || 'Unknown Author'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {book.subjects?.map((subject, index) => (
                      <Badge key={index} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Publisher</h4>
                      <p>{book.publisher || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Year Published</h4>
                      <p>{book.year || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">ISBN</h4>
                      <p>{book.isbn}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {book.tags?.length > 0 ? (
                          book.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">No tags</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Availability</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                        <span>
                          {book.copiesAvailable} of {book.copiesTotal} copies available
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${(book.copiesAvailable / book.copiesTotal) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRole === 'Student' && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => setIsIssueDialogOpen(true)}
                      disabled={!canIssue}
                    >
                      <Book className="mr-2 h-4 w-4" />
                      {canIssue ? 'Borrow This Book' : 'Not Available'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsReturnDialogOpen(true)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Return Book
                    </Button>
                  </>
                )}

                {(userRole === 'Librarian' || userRole === 'Admin' || userRole === 'SuperAdmin') && (
                  <>
                    <Button className="w-full">
                      <Book className="mr-2 h-4 w-4" />
                      Issue Book
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Return Book
                    </Button>
                    <Button variant="secondary" className="w-full">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Edit Book
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Book Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Copies</span>
                    <span className="font-medium">{book.copiesTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available</span>
                    <span className={`font-medium ${book.copiesAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {book.copiesAvailable}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Borrowed</span>
                    <span className="font-medium">{book.copiesTotal - book.copiesAvailable}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Issue Book Dialog */}
        <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Book Borrow</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to borrow <strong>{book.title}</strong>?</p>
              <p className="text-sm text-muted-foreground mt-2">
                Due date will be 14 days from today. Late returns may incur fines.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleIssueBook}>
                Confirm Borrow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Return Book Dialog */}
        <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Return Book</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you returning <strong>{book.title}</strong>?</p>
              <p className="text-sm text-muted-foreground mt-2">
                Any late fees will be calculated upon return.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReturnBook}>
                Confirm Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={() => setIsConfirmDialogOpen(false)}
          title={actionType === 'issue' ? "Book Borrowed Successfully" : "Book Returned Successfully"}
          description={actionType === 'issue'
            ? "You have successfully borrowed this book. Please return it by the due date to avoid fines."
            : "Thank you for returning the book. Any applicable fines have been calculated."}
          confirmText="OK"
          variant="default"
        />
      </div>
    </>
  );
};

export default BookDetails;
// import { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Calendar, AlertCircle } from 'lucide-react';
// import libraryService from '@/services/libraryService';
// import toast from "react-hot-toast";

// export default function MyLoans() {
//   const [loans, setLoans] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchLoans = async () => {
//       try {
//         const data = await libraryService.getMyLoans();
//         setLoans(data);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load loans");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchLoans();
//   }, []);

//   if (isLoading) {
//     return <div className="p-4">Loading your loans...</div>;
//   }

//   if (loans.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Your Loans</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-muted-foreground">You have no active loans.</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//  <>
//     <Card>
//       <CardHeader>
//         <CardTitle>Your Active Loans</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Title</TableHead>
//               <TableHead>Author</TableHead>
//               <TableHead>Issued</TableHead>
//               <TableHead>Due Date</TableHead>
//               <TableHead>Status</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loans.map((loan) => {
//               const isOverdue = new Date() > new Date(loan.dueDate);
//               return (
//                 <TableRow key={loan._id}>
//                   <TableCell className="font-medium">{loan.book.title}</TableCell>
//                   <TableCell>{loan.book.author}</TableCell>
//                   <TableCell>{new Date(loan.issuedAt).toLocaleDateString()}</TableCell>
//                   <TableCell className={isOverdue ? "text-destructive font-medium" : ""}>
//                     {new Date(loan.dueDate).toLocaleDateString()}
//                     {isOverdue && <AlertCircle className="ml-2 h-4 w-4 inline" />}
//                   </TableCell>
//                   <TableCell>
//                     <span className={`px-2 py-1 rounded text-xs ${
//                       isOverdue ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"
//                     }`}>
//                       {isOverdue ? "OVERDUE" : "Active"}
//                     </span>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
// </>
//   );
// }


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/config/api';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';

const MyLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [fines, setFines] = useState({ total: 0, overdue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    fetchMyLoans();
    fetchMyFines();
  }, []);

  const fetchMyLoans = async () => {
    try {
      const res = await api.get('/library/loans');
      setLoans(res.data.loans || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyFines = async () => {
    try {
      const res = await api.get('/library/fines');
      setFines(res.data || { total: 0, overdue: 0 });
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const handleReturnBook = async (loanId, bookId) => {
    try {
      await api.post(`/library/books/${bookId}/return`, {
        userId: user?._id
      });
      setIsReturnDialogOpen(false);
      setSelectedLoan(null);
      fetchMyLoans();
      fetchMyFines();
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fines Summary */}
      {(fines.total > 0 || fines.overdue > 0) && (
        <Card className={fines.total > 0 ? 'border-destructive' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
              Library Fines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Fines</p>
                <p className="text-2xl font-bold text-destructive">₹{fines.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Items</p>
                <p className="text-2xl font-bold">{fines.overdue}</p>
              </div>
            </div>
            {fines.total > 0 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive">
                  Please settle your fines at the library desk to avoid restrictions on future borrowing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            My Borrowed Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No borrowed books</h3>
              <p className="text-muted-foreground">Visit the library catalog to borrow books</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Issued On</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const daysOverdue = calculateDaysOverdue(loan.dueOn);
                    const isOverdue = daysOverdue > 0;
                    
                    return (
                      <TableRow key={loan._id}>
                        <TableCell className="font-medium">
                          {loan.book?.title || 'Unknown Book'}
                        </TableCell>
                        <TableCell>{formatDate(loan.issuedOn)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {formatDate(loan.dueOn)}
                            {isOverdue && (
                              <Badge variant="destructive" className="ml-2">
                                {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {loan.returnedOn ? (
                            <Badge variant="secondary">Returned</Badge>
                          ) : (
                            <Badge variant={isOverdue ? "destructive" : "default"}>
                              {isOverdue ? "Overdue" : "Active"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          ₹{loan.fineAccrued?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>
                          {!loan.returnedOn && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setIsReturnDialogOpen(true);
                              }}
                            >
                              <Clock className="mr-1 h-4 w-4" />
                              Return
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Book Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isReturnDialogOpen}
        onClose={() => {
          setIsReturnDialogOpen(false);
          setSelectedLoan(null);
        }}
        onConfirm={() => selectedLoan && handleReturnBook(selectedLoan._id, selectedLoan.bookId)}
        title="Return Book"
        description={
          selectedLoan 
            ? `Are you sure you want to return "${selectedLoan.book?.title}"?`
            : "Are you sure you want to return this book?"
        }
        confirmText="Confirm Return"
        variant="default"
      />
    </div>
  );
};

export default MyLoans;
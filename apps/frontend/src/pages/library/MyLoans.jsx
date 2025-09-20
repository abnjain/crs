import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, AlertCircle } from 'lucide-react';
import libraryService from '@/services/libraryService';
import { toast } from 'react-hot-toast';

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await libraryService.getMyLoans();
        setLoans(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load loans");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoans();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading your loans...</div>;
  }

  if (loans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You have no active loans.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Active Loans</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => {
              const isOverdue = new Date() > new Date(loan.dueDate);
              return (
                <TableRow key={loan._id}>
                  <TableCell className="font-medium">{loan.book.title}</TableCell>
                  <TableCell>{loan.book.author}</TableCell>
                  <TableCell>{new Date(loan.issuedAt).toLocaleDateString()}</TableCell>
                  <TableCell className={isOverdue ? "text-destructive font-medium" : ""}>
                    {new Date(loan.dueDate).toLocaleDateString()}
                    {isOverdue && <AlertCircle className="ml-2 h-4 w-4 inline" />}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isOverdue ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"
                    }`}>
                      {isOverdue ? "OVERDUE" : "Active"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
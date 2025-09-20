import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Mail } from 'lucide-react';

export default function LibraryQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Need Help?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Teachers can view book availability and loan status. For borrowing, returning, or extensions, please contact the library.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* <Button variant="outline" className="flex-1"> */}
          <Button variant="default" className="flex-1">
            <Mail className="mr-2 h-4 w-4" /> Email Librarian
          </Button>
          {/* <Button variant="outline" className="flex-1"> */}
          <Button variant="default" className="flex-1">
            <HelpCircle className="mr-2 h-4 w-4" /> Library Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
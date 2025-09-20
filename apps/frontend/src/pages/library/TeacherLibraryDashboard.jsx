import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, BookOpen, History } from 'lucide-react';
import BookSearch from './BookSearch';
import BookList from './BookList';
import MyLoans from './MyLoans';
import LibraryQuickActions from './LibraryQuickActions';
import libraryService from '@/services/libraryService';
import { toast } from 'react-hot-toast';

export default function TeacherLibraryDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query) => {
    setIsLoading(true);
    try {
      const results = await libraryService.searchBooks(query);
      setBooks(results);
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Load all books on mount
  useEffect(() => {
    handleSearch('');
  }, []);

  const handleViewDetail = (bookId) => {
    // We'll handle routing in Step 10
    window.location.href = `/library/books/${bookId}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Library</h1>
          <p className="text-sm text-secondText">Search, view, and manage your library resources</p>
        </div>

        <LibraryQuickActions />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="search">
              <Book className="mr-2 h-4 w-4" /> Search Books
            </TabsTrigger>
            <TabsTrigger value="loans">
              <BookOpen className="mr-2 h-4 w-4" /> My Loans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card className="p-6">
              <BookSearch onSearch={handleSearch} />
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <BookList books={books} onViewDetail={handleViewDetail} />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="loans">
            <MyLoans />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Book, Clock, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import libraryService from '@/services/libraryService';
import BookGrid from './BookGrid';
import MyLoans from './MyLoans';
import BookSearch from './BookSearch';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LibraryQuickActions from './LibraryQuickActions';

const LibraryDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    if (searchQuery.length >= 2 || searchQuery === '') {
      searchBooks(searchQuery);
    }
  }, [searchQuery]);

  const searchBooks = async (query) => {
    setIsLoading(true);
    try {
      const results = await libraryService.searchBooks(query);
      setBooks(results);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6 p-4 md:p-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Library</h1>
            <p className="text-muted-foreground">
              Search, borrow, and manage your library resources
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Library Search</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by title, author, subject..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={clearSearch}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {user?.roles?.includes('Librarian') || user?.roles?.includes('Admin') || user?.roles?.includes('SuperAdmin') ? (
                  <Button className="sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Book
                  </Button>
                ) : null}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
                  <TabsTrigger value="search">
                    <Book className="mr-2 h-4 w-4" />
                    Search Books
                  </TabsTrigger>
                  <TabsTrigger value="my-loans">
                    <Clock className="mr-2 h-4 w-4" />
                    My Loans
                  </TabsTrigger>
                  {user?.roles?.includes('Librarian') || user?.roles?.includes('Admin') || user?.roles?.includes('SuperAdmin') ? (
                    <TabsTrigger value="management">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Management
                    </TabsTrigger>
                  ) : null}
                </TabsList>

                <TabsContent value="search">
                  <BookSearch
                    books={books}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="my-loans">
                  <MyLoans />
                </TabsContent>

                {/* {(user?.roles?.includes('Librarian') || user?.roles?.includes('Admin') || user?.roles?.includes('SuperAdmin')) && ( */}
                {(user?.roles?.includes('Teacher') || user?.roles?.includes('Librarian') || user?.roles?.includes('Admin') || user?.roles?.includes('SuperAdmin')) && (
                  <TabsContent value="management">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Library Management</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                          <CardHeader>
                            <CardTitle>Issue Book</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Manage book issuance to students and staff</p>
                            <Button className="mt-4 w-full">Issue Book</Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Return Book</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Process book returns and calculate fines</p>
                            <Button className="mt-4 w-full">Return Book</Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Add/Edit Books</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Add new books or update existing records</p>
                            <Button className="mt-4 w-full">Manage Catalog</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <LibraryQuickActions />

      </DashboardLayout>
    </>
  );
};

export default LibraryDashboard;
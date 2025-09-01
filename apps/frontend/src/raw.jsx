// import React, { useState, useEffect, createContext, useContext } from 'react';
// import { 
//   Home, 
//   BookOpen, 
//   Users, 
//   Calendar, 
//   Briefcase, 
//   FileText, 
//   Bell, 
//   Settings, 
//   LogOut, 
//   Moon, 
//   Sun, 
//   Menu, 
//   X, 
//   Search, 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Eye 
// } from 'lucide-react';

// // Theme Context for dark/light mode
// const ThemeContext = createContext();

// // Custom hook for theme
// const useTheme = () => useContext(ThemeContext);

// // Auth Context for protected routes
// const AuthContext = createContext();

// // Custom hook for authentication
// const useAuth = () => useContext(AuthContext);

// // Reusable Button Component
// const Button = ({ children, variant = 'default', size = 'default', onClick, className = '', disabled = false, ...props }) => {
//   const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  
//   const variantClasses = {
//     default: "bg-primary text-primary-foreground hover:bg-primary/90",
//     destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
//     outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//     secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
//     ghost: "hover:bg-accent hover:text-accent-foreground",
//     link: "text-primary underline-offset-4 hover:underline"
//   };
  
//   const sizeClasses = {
//     default: "h-10 px-4 py-2",
//     sm: "h-9 rounded-md px-3",
//     lg: "h-11 rounded-md px-8",
//     icon: "h-10 w-10"
//   };
  
//   return (
//     <button
//       className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
//       onClick={onClick}
//       disabled={disabled}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };

// // Reusable Card Component
// const Card = ({ children, className = '' }) => {
//   return (
//     <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
//       {children}
//     </div>
//   );
// };

// Card.Header = ({ children, className = '' }) => {
//   return (
//     <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
//       {children}
//     </div>
//   );
// };

// Card.Title = ({ children, className = '' }) => {
//   return (
//     <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
//       {children}
//     </h3>
//   );
// };

// Card.Content = ({ children, className = '' }) => {
//   return (
//     <div className={`p-6 pt-0 ${className}`}>
//       {children}
//     </div>
//   );
// };

// Card.Footer = ({ children, className = '' }) => {
//   return (
//     <div className={`flex items-center p-6 pt-0 ${className}`}>
//       {children}
//     </div>
//   );
// };

// // Reusable Input Component
// const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
//   return (
//     <input
//       type={type}
//       className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//       ref={ref}
//       {...props}
//     />
//   );
// });
// Input.displayName = "Input";

// // Reusable Label Component
// const Label = React.forwardRef(({ className = '', ...props }, ref) => {
//   return (
//     <label
//       className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
//       ref={ref}
//       {...props}
//     />
//   );
// });
// Label.displayName = "Label";

// // Reusable Badge Component
// const Badge = ({ children, variant = 'default', className = '' }) => {
//   const variantClasses = {
//     default: "bg-primary text-primary-foreground",
//     secondary: "bg-secondary text-secondary-foreground",
//     destructive: "bg-destructive text-destructive-foreground",
//     outline: "text-foreground border border-input"
//   };
  
//   return (
//     <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`}>
//       {children}
//     </div>
//   );
// };

// // Reusable Table Component
// const Table = ({ children }) => {
//   return (
//     <div className="w-full overflow-auto">
//       <table className="w-full caption-bottom text-sm">
//         {children}
//       </table>
//     </div>
//   );
// };

// Table.Header = ({ children }) => {
//   return (
//     <thead className="[&_tr]:border-b">
//       {children}
//     </thead>
//   );
// };

// Table.Body = ({ children }) => {
//   return (
//     <tbody className="[&_tr:last-child]:border-0">
//       {children}
//     </tbody>
//   );
// };

// Table.Row = ({ children }) => {
//   return (
//     <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
//       {children}
//     </tr>
//   );
// };

// Table.Head = ({ children, className = '' }) => {
//   return (
//     <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className}`}>
//       {children}
//     </th>
//   );
// };

// Table.Cell = ({ children, className = '' }) => {
//   return (
//     <td className={`p-4 align-middle ${className}`}>
//       {children}
//     </td>
//   );
// };

// // Reusable Dialog Component
// const Dialog = ({ children, open, onOpenChange }) => {
//   if (!open) return null;
  
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
//       <div className="relative bg-background rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
//         {children}
//       </div>
//     </div>
//   );
// };

// Dialog.Content = ({ children }) => {
//   return <>{children}</>;
// };

// Dialog.Header = ({ children }) => {
//   return <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
// };

// Dialog.Title = ({ children }) => {
//   return <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>;
// };

// Dialog.Description = ({ children }) => {
//   return <p className="text-sm text-muted-foreground">{children}</p>;
// };

// Dialog.Footer = ({ children }) => {
//   return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">{children}</div>;
// };

// // Sidebar Component
// const Sidebar = ({ isOpen, onClose, activeSection, onSectionChange }) => {
//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: Home },
//     { id: 'library', label: 'Library', icon: BookOpen },
//     { id: 'students', label: 'Students', icon: Users },
//     { id: 'staff', label: 'Staff & Teachers', icon: Users },
//     { id: 'attendance', label: 'Attendance', icon: Calendar },
//     { id: 'placements', label: 'Placements', icon: Briefcase },
//     { id: 'notices', label: 'Notices', icon: Bell },
//     { id: 'documents', label: 'Documents', icon: FileText },
//     { id: 'settings', label: 'Settings', icon: Settings }
//   ];

//   return (
//     <>
//       {/* Overlay for mobile */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
//           onClick={onClose}
//         />
//       )}
      
//       {/* Sidebar */}
//       <aside 
//         className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-background border-r transform ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
//       >
//         <div className="flex h-16 items-center border-b px-6">
//           <h1 className="text-xl font-bold">College Central</h1>
//         </div>
        
//         <nav className="p-4 space-y-2">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => {
//                   onSectionChange(item.id);
//                   onClose();
//                 }}
//                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
//                   activeSection === item.id 
//                     ? 'bg-primary text-primary-foreground' 
//                     : 'hover:bg-accent hover:text-accent-foreground'
//                 }`}
//               >
//                 <Icon className="h-4 w-4" />
//                 {item.label}
//               </button>
//             );
//           })}
//         </nav>
        
//         <div className="absolute bottom-0 w-full p-4 border-t">
//           <Button 
//             variant="ghost" 
//             className="w-full justify-start"
//             onClick={() => {
//               // Logout functionality would go here
//               console.log('Logout');
//             }}
//           >
//             <LogOut className="h-4 w-4 mr-2" />
//             Logout
//           </Button>
//         </div>
//       </aside>
//     </>
//   );
// };

// // Header Component
// const Header = ({ onMenuClick, theme, toggleTheme }) => {
//   const ThemeIcon = theme === 'dark' ? Sun : Moon;
  
//   return (
//     <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
//       <button 
//         onClick={onMenuClick}
//         className="lg:hidden"
//       >
//         <Menu className="h-6 w-6" />
//       </button>
      
//       <div className="flex-1">
//         <div className="relative">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input 
//             type="search" 
//             placeholder="Search..." 
//             className="pl-8"
//           />
//         </div>
//       </div>
      
//       <Button 
//         variant="ghost" 
//         size="icon"
//         onClick={toggleTheme}
//       >
//         <ThemeIcon className="h-5 w-5" />
//       </Button>
//     </header>
//   );
// };

// // Dashboard Component
// const Dashboard = () => {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
//         <p className="text-muted-foreground">Welcome to College Central Repository System</p>
//       </div>
      
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <Card.Header>
//             <Card.Title>Total Students</Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="text-3xl font-bold">2,458</div>
//             <p className="text-sm text-muted-foreground">+12% from last month</p>
//           </Card.Content>
//         </Card>
        
//         <Card>
//           <Card.Header>
//             <Card.Title>Staff Members</Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="text-3xl font-bold">142</div>
//             <p className="text-sm text-muted-foreground">+3 from last month</p>
//           </Card.Content>
//         </Card>
        
//         <Card>
//           <Card.Header>
//             <Card.Title>Library Books</Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="text-3xl font-bold">12,345</div>
//             <p className="text-sm text-muted-foreground">+156 added this month</p>
//           </Card.Content>
//         </Card>
        
//         <Card>
//           <Card.Header>
//             <Card.Title>Placements</Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="text-3xl font-bold">89%</div>
//             <p className="text-sm text-muted-foreground">Placement rate this year</p>
//           </Card.Content>
//         </Card>
//       </div>
      
//       <Card>
//         <Card.Header>
//           <Card.Title>Recent Notices</Card.Title>
//         </Card.Header>
//         <Card.Content>
//           <Table>
//             <Table.Header>
//               <Table.Row>
//                 <Table.Head>Title</Table.Head>
//                 <Table.Head>Date</Table.Head>
//                 <Table.Head>Status</Table.Head>
//                 <Table.Head>Actions</Table.Head>
//               </Table.Row>
//             </Table.Header>
//             <Table.Body>
//               {[
//                 { id: 1, title: 'Semester Exams Schedule', date: '2023-12-01', status: 'Published' },
//                 { id: 2, title: 'Library Holiday Notice', date: '2023-11-28', status: 'Published' },
//                 { id: 3, title: 'Placement Drive Registration', date: '2023-11-25', status: 'Draft' }
//               ].map((notice) => (
//                 <Table.Row key={notice.id}>
//                   <Table.Cell>{notice.title}</Table.Cell>
//                   <Table.Cell>{notice.date}</Table.Cell>
//                   <Table.Cell>
//                     <Badge variant={notice.status === 'Published' ? 'default' : 'secondary'}>
//                       {notice.status}
//                     </Badge>
//                   </Table.Cell>
//                   <Table.Cell>
//                     <div className="flex gap-2">
//                       <Button variant="ghost" size="icon">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </Table.Cell>
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>
//         </Card.Content>
//       </Card>
//     </div>
//   );
// };

// // Students Component
// const Students = () => {
//   const [students] = useState([
//     { id: 1, name: 'John Doe', rollNo: 'CS2023001', department: 'Computer Science', year: '3rd', email: 'john.doe@college.edu' },
//     { id: 2, name: 'Jane Smith', rollNo: 'CS2023002', department: 'Computer Science', year: '3rd', email: 'jane.smith@college.edu' },
//     { id: 3, name: 'Robert Johnson', rollNo: 'ME2023001', department: 'Mechanical Engineering', year: '2nd', email: 'robert.j@college.edu' },
//     { id: 4, name: 'Emily Davis', rollNo: 'EE2023001', department: 'Electrical Engineering', year: '4th', email: 'emily.d@college.edu' },
//     { id: 5, name: 'Michael Brown', rollNo: 'CE2023001', department: 'Civil Engineering', year: '1st', email: 'michael.b@college.edu' }
//   ]);
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
//   const filteredStudents = students.filter(student => 
//     student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     student.department.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
//           <p className="text-muted-foreground">Manage student records and information</p>
//         </div>
//         <Button onClick={() => setIsAddDialogOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Student
//         </Button>
//       </div>
      
//       <div className="relative">
//         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//         <Input 
//           type="search" 
//           placeholder="Search students..." 
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="pl-8"
//         />
//       </div>
      
//       <Card>
//         <Card.Content>
//           <Table>
//             <Table.Header>
//               <Table.Row>
//                 <Table.Head>Name</Table.Head>
//                 <Table.Head>Roll No</Table.Head>
//                 <Table.Head>Department</Table.Head>
//                 <Table.Head>Year</Table.Head>
//                 <Table.Head>Email</Table.Head>
//                 <Table.Head>Actions</Table.Head>
//               </Table.Row>
//             </Table.Header>
//             <Table.Body>
//               {filteredStudents.map((student) => (
//                 <Table.Row key={student.id}>
//                   <Table.Cell className="font-medium">{student.name}</Table.Cell>
//                   <Table.Cell>{student.rollNo}</Table.Cell>
//                   <Table.Cell>{student.department}</Table.Cell>
//                   <Table.Cell>{student.year}</Table.Cell>
//                   <Table.Cell>{student.email}</Table.Cell>
//                   <Table.Cell>
//                     <div className="flex gap-2">
//                       <Button variant="ghost" size="icon">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </Table.Cell>
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>
//         </Card.Content>
//       </Card>
      
//       {/* Add Student Dialog */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <Dialog.Content>
//           <Dialog.Header>
//             <Dialog.Title>Add New Student</Dialog.Title>
//             <Dialog.Description>
//               Enter the student details to add them to the system.
//             </Dialog.Description>
//           </Dialog.Header>
//           <form className="space-y-4 py-4">
//             <div className="grid gap-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="name">Full Name</Label>
//                 <Input id="name" placeholder="Enter student name" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="rollNo">Roll Number</Label>
//                 <Input id="rollNo" placeholder="Enter roll number" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="department">Department</Label>
//                 <select id="department" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                   <option value="">Select department</option>
//                   <option value="CS">Computer Science</option>
//                   <option value="ME">Mechanical Engineering</option>
//                   <option value="EE">Electrical Engineering</option>
//                   <option value="CE">Civil Engineering</option>
//                   <option value="EC">Electronics & Communication</option>
//                 </select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="year">Year</Label>
//                 <select id="year" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                   <option value="">Select year</option>
//                   <option value="1st">1st Year</option>
//                   <option value="2nd">2nd Year</option>
//                   <option value="3rd">3rd Year</option>
//                   <option value="4th">4th Year</option>
//                 </select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input id="email" type="email" placeholder="Enter email address" required />
//               </div>
//             </div>
//             <Dialog.Footer>
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit">Add Student</Button>
//             </Dialog.Footer>
//           </form>
//         </Dialog.Content>
//       </Dialog>
//     </div>
//   );
// };

// // Staff Component
// const Staff = () => {
//   const [staff] = useState([
//     { id: 1, name: 'Dr. Alice Johnson', role: 'Professor', department: 'Computer Science', email: 'alice.j@college.edu', phone: '+1-234-567-8901' },
//     { id: 2, name: 'Prof. Robert Smith', role: 'Associate Professor', department: 'Mechanical Engineering', email: 'robert.s@college.edu', phone: '+1-234-567-8902' },
//     { id: 3, name: 'Dr. Sarah Williams', role: 'Assistant Professor', department: 'Electrical Engineering', email: 'sarah.w@college.edu', phone: '+1-234-567-8903' },
//     { id: 4, name: 'Mr. David Brown', role: 'Lecturer', department: 'Civil Engineering', email: 'david.b@college.edu', phone: '+1-234-567-8904' },
//     { id: 5, name: 'Ms. Emily Davis', role: 'Lab Technician', department: 'Computer Science', email: 'emily.d@college.edu', phone: '+1-234-567-8905' }
//   ]);
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
//   const filteredStaff = staff.filter(member => 
//     member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     member.department.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
//           <p className="text-muted-foreground">Manage staff and teacher records</p>
//         </div>
//         <Button onClick={() => setIsAddDialogOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Staff
//         </Button>
//       </div>
      
//       <div className="relative">
//         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//         <Input 
//           type="search" 
//           placeholder="Search staff..." 
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="pl-8"
//         />
//       </div>
      
//       <Card>
//         <Card.Content>
//           <Table>
//             <Table.Header>
//               <Table.Row>
//                 <Table.Head>Name</Table.Head>
//                 <Table.Head>Role</Table.Head>
//                 <Table.Head>Department</Table.Head>
//                 <Table.Head>Email</Table.Head>
//                 <Table.Head>Phone</Table.Head>
//                 <Table.Head>Actions</Table.Head>
//               </Table.Row>
//             </Table.Header>
//             <Table.Body>
//               {filteredStaff.map((member) => (
//                 <Table.Row key={member.id}>
//                   <Table.Cell className="font-medium">{member.name}</Table.Cell>
//                   <Table.Cell>{member.role}</Table.Cell>
//                   <Table.Cell>{member.department}</Table.Cell>
//                   <Table.Cell>{member.email}</Table.Cell>
//                   <Table.Cell>{member.phone}</Table.Cell>
//                   <Table.Cell>
//                     <div className="flex gap-2">
//                       <Button variant="ghost" size="icon">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </Table.Cell>
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>
//         </Card.Content>
//       </Card>
      
//       {/* Add Staff Dialog */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <Dialog.Content>
//           <Dialog.Header>
//             <Dialog.Title>Add New Staff Member</Dialog.Title>
//             <Dialog.Description>
//               Enter the staff details to add them to the system.
//             </Dialog.Description>
//           </Dialog.Header>
//           <form className="space-y-4 py-4">
//             <div className="grid gap-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="name">Full Name</Label>
//                 <Input id="name" placeholder="Enter staff name" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="role">Role</Label>
//                 <select id="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                   <option value="">Select role</option>
//                   <option value="Professor">Professor</option>
//                   <option value="Associate Professor">Associate Professor</option>
//                   <option value="Assistant Professor">Assistant Professor</option>
//                   <option value="Lecturer">Lecturer</option>
//                   <option value="Lab Technician">Lab Technician</option>
//                   <option value="Administrative Staff">Administrative Staff</option>
//                 </select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="department">Department</Label>
//                 <select id="department" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                   <option value="">Select department</option>
//                   <option value="CS">Computer Science</option>
//                   <option value="ME">Mechanical Engineering</option>
//                   <option value="EE">Electrical Engineering</option>
//                   <option value="CE">Civil Engineering</option>
//                   <option value="EC">Electronics & Communication</option>
//                 </select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input id="email" type="email" placeholder="Enter email address" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="phone">Phone</Label>
//                 <Input id="phone" type="tel" placeholder="Enter phone number" required />
//               </div>
//             </div>
//             <Dialog.Footer>
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit">Add Staff</Button>
//             </Dialog.Footer>
//           </form>
//         </Dialog.Content>
//       </Dialog>
//     </div>
//   );
// };

// // Library Component
// const Library = () => {
//   const [books] = useState([
//     { id: 1, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', available: 5, total: 8 },
//     { id: 2, title: 'Engineering Mechanics', author: 'R.C. Hibbeler', isbn: '978-0133918922', category: 'Mechanical Engineering', available: 3, total: 5 },
//     { id: 3, title: 'Electric Circuits', author: 'James W. Nilsson', isbn: '978-0133760033', category: 'Electrical Engineering', available: 7, total: 7 },
//     { id: 4, title: 'Structural Analysis', author: 'R.C. Hibbeler', isbn: '978-0134610672', category: 'Civil Engineering', available: 2, total: 4 },
//     { id: 5, title: 'Digital Communications', author: 'John G. Proakis', isbn: '978-0072957167', category: 'Electronics & Communication', available: 4, total: 6 }
//   ]);
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
//   const filteredBooks = books.filter(book => 
//     book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     book.category.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Library Management</h2>
//           <p className="text-muted-foreground">Manage library books and resources</p>
//         </div>
//         <Button onClick={() => setIsAddDialogOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Book
//         </Button>
//       </div>
      
//       <div className="relative">
//         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//         <Input 
//           type="search" 
//           placeholder="Search books..." 
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="pl-8"
//         />
//       </div>
      
//       <Card>
//         <Card.Content>
//           <Table>
//             <Table.Header>
//               <Table.Row>
//                 <Table.Head>Title</Table.Head>
//                 <Table.Head>Author</Table.Head>
//                 <Table.Head>ISBN</Table.Head>
//                 <Table.Head>Category</Table.Head>
//                 <Table.Head>Availability</Table.Head>
//                 <Table.Head>Actions</Table.Head>
//               </Table.Row>
//             </Table.Header>
//             <Table.Body>
//               {filteredBooks.map((book) => (
//                 <Table.Row key={book.id}>
//                   <Table.Cell className="font-medium">{book.title}</Table.Cell>
//                   <Table.Cell>{book.author}</Table.Cell>
//                   <Table.Cell>{book.isbn}</Table.Cell>
//                   <Table.Cell>{book.category}</Table.Cell>
//                   <Table.Cell>
//                     <Badge variant={book.available > 0 ? 'default' : 'destructive'}>
//                       {book.available}/{book.total} available
//                     </Badge>
//                   </Table.Cell>
//                   <Table.Cell>
//                     <div className="flex gap-2">
//                       <Button variant="ghost" size="icon">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </Table.Cell>
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>
//         </Card.Content>
//       </Card>
      
//       {/* Add Book Dialog */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <Dialog.Content>
//           <Dialog.Header>
//             <Dialog.Title>Add New Book</Dialog.Title>
//             <Dialog.Description>
//               Enter the book details to add it to the library.
//             </Dialog.Description>
//           </Dialog.Header>
//           <form className="space-y-4 py-4">
//             <div className="grid gap-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="title">Title</Label>
//                 <Input id="title" placeholder="Enter book title" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="author">Author</Label>
//                 <Input id="author" placeholder="Enter author name" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="isbn">ISBN</Label>
//                 <Input id="isbn" placeholder="Enter ISBN number" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="category">Category</Label>
//                 <select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                   <option value="">Select category</option>
//                   <option value="CS">Computer Science</option>
//                   <option value="ME">Mechanical Engineering</option>
//                   <option value="EE">Electrical Engineering</option>
//                   <option value="CE">Civil Engineering</option>
//                   <option value="EC">Electronics & Communication</option>
//                   <option value="Mathematics">Mathematics</option>
//                   <option value="Physics">Physics</option>
//                   <option value="Chemistry">Chemistry</option>
//                 </select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="total">Total Copies</Label>
//                 <Input id="total" type="number" placeholder="Enter total number of copies" required />
//               </div>
//             </div>
//             <Dialog.Footer>
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit">Add Book</Button>
//             </Dialog.Footer>
//           </form>
//         </Dialog.Content>
//       </Dialog>
//     </div>
//   );
// };

// // Attendance Component
// const Attendance = () => {
//   const [attendanceRecords] = useState([
//     { id: 1, student: 'John Doe', course: 'Data Structures', date: '2023-12-01', status: 'Present' },
//     { id: 2, student: 'Jane Smith', course: 'Data Structures', date: '2023-12-01', status: 'Present' },
//     { id: 3, student: 'Robert Johnson', course: 'Data Structures', date: '2023-12-01', status: 'Absent' },
//     { id: 4, student: 'Emily Davis', course: 'Data Structures', date: '2023-12-01', status: 'Present' },
//     { id: 5, student: 'Michael Brown', course: 'Data Structures', date: '2023-12-01', status: 'Present' }
//   ]);
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedDate, setSelectedDate] = useState('2023-12-01');
//   const [selectedCourse, setSelectedCourse] = useState('Data Structures');
  
//   const filteredRecords = attendanceRecords.filter(record => 
//     record.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     record.course.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
//         <p className="text-muted-foreground">Manage student attendance records</p>
//       </div>
      
//       <Card>
//         <Card.Header>
//           <Card.Title>Attendance Records</Card.Title>
//         </Card.Header>
//         <Card.Content>
//           <div className="flex flex-col md:flex-row gap-4 mb-6">
//             <div className="flex-1 relative">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input 
//                 type="search" 
//                 placeholder="Search students..." 
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-8"
//               />
//             </div>
//             <div className="w-full md:w-48">
//               <Label htmlFor="course">Course</Label>
//               <select 
//                 id="course" 
//                 value={selectedCourse}
//                 onChange={(e) => setSelectedCourse(e.target.value)}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//               >
//                 <option value="Data Structures">Data Structures</option>
//                 <option value="Algorithms">Algorithms</option>
//                 <option value="Database Systems">Database Systems</option>
//                 <option value="Operating Systems">Operating Systems</option>
//               </select>
//             </div>
//             <div className="w-full md:w-48">
//               <Label htmlFor="date">Date</Label>
//               <Input 
//                 id="date" 
//                 type="date" 
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//               />
//             </div>
//           </div>
          
//           <Table>
//             <Table.Header>
//               <Table.Row>
//                 <Table.Head>Student</Table.Head>
//                 <Table.Head>Course</Table.Head>
//                 <Table.Head>Date</Table.Head>
//                 <Table.Head>Status</Table.Head>
//                 <Table.Head>Actions</Table.Head>
//               </Table.Row>
//             </Table.Header>
//             <Table.Body>
//               {filteredRecords.map((record) => (
//                 <Table.Row key={record.id}>
//                   <Table.Cell className="font-medium">{record.student}</Table.Cell>
//                   <Table.Cell>{record.course}</Table.Cell>
//                   <Table.Cell>{record.date}</Table.Cell>
//                   <Table.Cell>
//                     <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
//                       {record.status}
//                     </Badge>
//                   </Table.Cell>
//                   <Table.Cell>
//                     <div className="flex gap-2">
//                       <Button variant="ghost" size="icon">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </Table.Cell>
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>
//         </Card.Content>
//       </Card>
//     </div>
//   );
// };

// // Placements Component
// const Placements = () => {
//   const [placements] = useState([
//     { id: 1, student: 'John Doe', company: 'TechCorp Inc.', position: 'Software Engineer', package: '$75,000', date: '2023-11-15' },
//     { id: 2, student: 'Jane Smith', company: 'Innovate Solutions', position: 'Data Analyst', package: '$65,000', date: '2023-11-10' },
//     { id: 3, student: 'Robert Johnson', company: 'Global Systems', position: 'Mechanical Engineer', package: '$60,000', date: '2023-11-08' },
//     { id: 4, student: 'Emily Davis', company: 'PowerGrid Ltd.', position: 'Electrical Engineer', package: '$58,000', date: '2023-11-05' }
//   ]);
  
//   const [stats] = useState({
//     totalPlacements: 142,
//     placementRate: 89,
//     avgPackage: '$67,500',
//     topCompany: 'TechCorp Inc.'
//   });
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
//   const filteredPlacements = placements.filter(placement => 
//     placement.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     placement.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     placement.position.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Placement Management</h2>
//           <p className="text-muted-foreground">Manage student job placements and allocations</p>
//         </div>
//         <Button onClick={() => setIsAddDialogOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Placement
//         </Button>
//       </div>
      
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <Card.Header>
//             <Card.Title>Total Placements</Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="text-3xl font-bold">{stats.totalPlacements}</div>
//             <p className="text-sm text-muted-foreground">This year</p>
//           </Card.Content>
//         </Card>
        
//         <Card>
//           <Card.Header>
//             <Card.Title>Placement Rate</Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="text-3xl font-bold">{stats.placementRate}%</div>
//             <p className="text-sm text-muted-foreground">Of eligible students</p>
//           </Card.Content>
//         </Card>
        
//         <Card>
//           <Card.Header>
//             <Card.Title>Avg. Package</Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="text-3xl font-bold">{stats.avgPackage}</div>
//             <p className="text-sm text-muted-foreground">Per annum</p>
//           </Card.Content>
//         </Card>
        
//         <Card>
//           <Card.Header>
//             <Card.Title>Top Company</Card.Title>
//           </Card.Header>
//           <Card.Content>
//             <div className="text-3xl font-bold">{stats.topCompany}</div>
//             <p className="text-sm text-muted-foreground">Hired 12 students</p>
//           </Card.Content>
//         </Card>
//       </div>
      
//       <div className="relative">
//         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//         <Input 
//           type="search" 
//           placeholder="Search placements..." 
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="pl-8"
//         />
//       </div>
      
//       <Card>
//         <Card.Content>
//           <Table>
//             <Table.Header>
//               <Table.Row>
//                 <Table.Head>Student</Table.Head>
//                 <Table.Head>Company</Table.Head>
//                 <Table.Head>Position</Table.Head>
//                 <Table.Head>Package</Table.Head>
//                 <Table.Head>Date</Table.Head>
//                 <Table.Head>Actions</Table.Head>
//               </Table.Row>
//             </Table.Header>
//             <Table.Body>
//               {filteredPlacements.map((placement) => (
//                 <Table.Row key={placement.id}>
//                   <Table.Cell className="font-medium">{placement.student}</Table.Cell>
//                   <Table.Cell>{placement.company}</Table.Cell>
//                   <Table.Cell>{placement.position}</Table.Cell>
//                   <Table.Cell>{placement.package}</Table.Cell>
//                   <Table.Cell>{placement.date}</Table.Cell>
//                   <Table.Cell>
//                     <div className="flex gap-2">
//                       <Button variant="ghost" size="icon">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </Table.Cell>
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>
//         </Card.Content>
//       </Card>
      
//       {/* Add Placement Dialog */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <Dialog.Content>
//           <Dialog.Header>
//             <Dialog.Title>Add New Placement</Dialog.Title>
//             <Dialog.Description>
//               Enter the placement details to record a new job allocation.
//             </Dialog.Description>
//           </Dialog.Header>
//           <form className="space-y-4 py-4">
//             <div className="grid gap-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="student">Student</Label>
//                 <select id="student" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                   <option value="">Select student</option>
//                   <option value="1">John Doe (CS2023001)</option>
//                   <option value="2">Jane Smith (CS2023002)</option>
//                   <option value="3">Robert Johnson (ME2023001)</option>
//                   <option value="4">Emily Davis (EE2023001)</option>
//                   <option value="5">Michael Brown (CE2023001)</option>
//                 </select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="company">Company</Label>
//                 <Input id="company" placeholder="Enter company name" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="position">Position</Label>
//                 <Input id="position" placeholder="Enter job position" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="package">Package</Label>
//                 <Input id="package" placeholder="Enter compensation package" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="date">Date</Label>
//                 <Input id="date" type="date" required />
//               </div>
//             </div>
//             <Dialog.Footer>
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit">Add Placement</Button>
//             </Dialog.Footer>
//           </form>
//         </Dialog.Content>
//       </Dialog>
//     </div>
//   );
// };

// // Notices Component
// const Notices = () => {
//   const [notices] = useState([
//     { id: 1, title: 'Semester Exams Schedule', content: 'The semester exams will be conducted from December 15th to December 30th...', category: 'Academic', status: 'Published', date: '2023-12-01', author: 'Dr. Alice Johnson' },
//     { id: 2, title: 'Library Holiday Notice', content: 'The library will remain closed on December 25th and 26th due to Christmas holidays...', category: 'Library', status: 'Published', date: '2023-11-28', author: 'Mr. David Brown' },
//     { id: 3, title: 'Placement Drive Registration', content: 'Registration for the upcoming placement drive is now open. All final year students must register by December 10th...', category: 'Placements', status: 'Draft', date: '2023-11-25', author: 'Prof. Robert Smith' }
//   ]);
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
//   const [selectedNotice, setSelectedNotice] = useState(null);
  
//   const filteredNotices = notices.filter(notice => 
//     notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     notice.category.toLowerCase().includes(searchTerm.toLowerCase())
//   );
  
//   const handleViewNotice = (notice) => {
//     setSelectedNotice(notice);
//     setIsViewDialogOpen(true);
//   };
  
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Notice Board</h2>
//           <p className="text-muted-foreground">Manage college notices and announcements</p>
//         </div>
//         <Button onClick={() => setIsAddDialogOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Notice
//         </Button>
//       </div>
      
//       <div className="relative">
//         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//         <Input 
//           type="search" 
//           placeholder="Search notices..." 
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="pl-8"
//         />
//       </div>
      
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {filteredNotices.map((notice) => (
//           <Card key={notice.id} className="flex flex-col h-full">
//             <Card.Header>
//               <div className="flex justify-between items-start">
//                 <Card.Title className="text-lg">{notice.title}</Card.Title>
//                 <Badge variant={notice.status === 'Published' ? 'default' : 'secondary'}>
//                   {notice.status}
//                 </Badge>
//               </div>
//               <div className="text-sm text-muted-foreground mt-1">
//                 {notice.category} • {notice.date}
//               </div>
//             </Card.Header>
//             <Card.Content className="flex-grow">
//               <p className="text-sm line-clamp-3">{notice.content}</p>
//             </Card.Content>
//             <Card.Footer>
//               <div className="flex justify-between items-center w-full">
//                 <span className="text-xs text-muted-foreground">By {notice.author}</span>
//                 <div className="flex gap-2">
//                   <Button 
//                     variant="ghost" 
//                     size="icon"
//                     onClick={() => handleViewNotice(notice)}
//                   >
//                     <Eye className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon">
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" size="icon">
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </Card.Footer>
//           </Card>
//         ))}
//       </div>
      
//       {/* View Notice Dialog */}
//       <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
//         {selectedNotice && (
//           <Dialog.Content>
//             <Dialog.Header>
//               <Dialog.Title>{selectedNotice.title}</Dialog.Title>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-muted-foreground">
//                   {selectedNotice.category} • {selectedNotice.date}
//                 </span>
//                 <Badge variant={selectedNotice.status === 'Published' ? 'default' : 'secondary'}>
//                   {selectedNotice.status}
//                 </Badge>
//               </div>
//             </Dialog.Header>
//             <div className="py-4">
//               <p className="whitespace-pre-wrap">{selectedNotice.content}</p>
//               <div className="mt-4 text-sm text-muted-foreground">
//                 Posted by {selectedNotice.author}
//               </div>
//             </div>
//             <Dialog.Footer>
//               <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
//                 Close
//               </Button>
//             </Dialog.Footer>
//           </Dialog.Content>
//         )}
//       </Dialog>
      
//       {/* Add Notice Dialog */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <Dialog.Content>
//           <Dialog.Header>
//             <Dialog.Title>Add New Notice</Dialog.Title>
//             <Dialog.Description>
//               Create a new notice or announcement for the college.
//             </Dialog.Description>
//           </Dialog.Header>
//           <form className="space-y-4 py-4">
//             <div className="grid gap-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="title">Title</Label>
//                 <Input id="title" placeholder="Enter notice title" required />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="category">Category</Label>
//                 <select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                   <option value="">Select category</option>
//                   <option value="Academic">Academic</option>
//                   <option value="Administrative">Administrative</option>
//                   <option value="Library">Library</option>
//                   <option value="Placements">Placements</option>
//                   <option value="Events">Events</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="content">Content</Label>
//                 <textarea 
//                   id="content"
//                   className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                   placeholder="Enter notice content..."
//                   required
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="status">Status</Label>
//                 <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
//                   <option value="Draft">Save as Draft</option>
//                   <option value="Published">Publish Immediately</option>
//                 </select>
//               </div>
//             </div>
//             <Dialog.Footer>
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button type="submit">Save Notice</Button>
//             </Dialog.Footer>
//           </form>
//         </Dialog.Content>
//       </Dialog>
//     </div>
//   );
// };

// // Documents Component
// const Documents = () => {
//   const [documents] = useState([
//     { id: 1, title: 'Course Syllabus - Data Structures', category: 'Academic', uploadedBy: 'Dr. Alice Johnson', date: '2023-11-20', size: '2.4 MB', type: 'PDF' },
//     { id: 2, title: 'Lab Manual - Electrical Circuits', category: 'Laboratory', uploadedBy: 'Prof. Robert Smith', date: '2023-11-18', size: '4.1 MB', type: 'PDF' },
//     { id: 3, title: 'Research Paper - AI Applications', category: 'Research', uploadedBy: 'Dr. Sarah Williams', date: '2023-11-15', size: '1.8 MB', type: 'PDF' },
//     { id: 4, title: 'Student Handbook 2023', category: 'Administrative', uploadedBy: 'Admin Office', date: '2023-11-10', size: '3.2 MB', type: 'PDF' },
//     { id: 5, title: 'Placement Brochure', category: 'Placements', uploadedBy: 'Placement Cell', date: '2023-11-05', size: '5.6 MB', type: 'PDF' }
//   ]);
  
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
  
//   const categories = ['All', 'Academic', 'Laboratory', 'Research', 'Administrative', 'Placements'];
  
//   const filteredDocuments = documents.filter(doc => {
//     const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });
  
//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
//         <p className="text-muted-foreground">Manage study materials and important documents</p>
//       </div>
      
//       <div className="flex flex-col md:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input 
//             type="search" 
//             placeholder="Search documents..." 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-8"
//           />
//         </div>
//         <div className="w-full md:w-48">
//           <Label htmlFor="category">Category</Label>
//           <select 
//             id="category" 
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//           >
//             {categories.map(category => (
//               <option key={category} value={category}>{category}</option>
//             ))}
//           </select>
//         </div>
//       </div>
      
//       <Card>
//         <Card.Content>
//           <Table>
//             <Table.Header>
//               <Table.Row>
//                 <Table.Head>Title</Table.Head>
//                 <Table.Head>Category</Table.Head>
//                 <Table.Head>Uploaded By</Table.Head>
//                 <Table.Head>Date</Table.Head>
//                 <Table.Head>Size</Table.Head>
//                 <Table.Head>Type</Table.Head>
//                 <Table.Head>Actions</Table.Head>
//               </Table.Row>
//             </Table.Header>
//             <Table.Body>
//               {filteredDocuments.map((doc) => (
//                 <Table.Row key={doc.id}>
//                   <Table.Cell className="font-medium">{doc.title}</Table.Cell>
//                   <Table.Cell>{doc.category}</Table.Cell>
//                   <Table.Cell>{doc.uploadedBy}</Table.Cell>
//                   <Table.Cell>{doc.date}</Table.Cell>
//                   <Table.Cell>{doc.size}</Table.Cell>
//                   <Table.Cell>
//                     <Badge variant="secondary">{doc.type}</Badge>
//                   </Table.Cell>
//                   <Table.Cell>
//                     <div className="flex gap-2">
//                       <Button variant="ghost" size="icon">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon">
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </Table.Cell>
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>
//         </Card.Content>
//       </Card>
//     </div>
//   );
// };

// // Settings Component
// const Settings = () => {
//   const [profile] = useState({
//     name: 'Admin User',
//     email: 'admin@college.edu',
//     role: 'System Administrator',
//     institution: 'ABC College of Engineering'
//   });
  
//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
//         <p className="text-muted-foreground">Manage system settings and preferences</p>
//       </div>
      
//       <Card>
//         <Card.Header>
//           <Card.Title>Profile Information</Card.Title>
//           <Card.Description>Update your profile details and contact information</Card.Description>
//         </Card.Header>
//         <Card.Content>
//           <div className="space-y-4">
//             <div className="grid gap-2">
//               <Label htmlFor="name">Full Name</Label>
//               <Input id="name" defaultValue={profile.name} />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" type="email" defaultValue={profile.email} />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="role">Role</Label>
//               <Input id="role" defaultValue={profile.role} disabled />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="institution">Institution</Label>
//               <Input id="institution" defaultValue={profile.institution} disabled />
//             </div>
//           </div>
//         </Card.Content>
//         <Card.Footer>
//           <Button>Save Changes</Button>
//         </Card.Footer>
//       </Card>
      
//       <Card>
//         <Card.Header>
//           <Card.Title>System Preferences</Card.Title>
//           <Card.Description>Configure system-wide settings</Card.Description>
//         </Card.Header>
//         <Card.Content>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="font-medium">Enable Notifications</div>
//                 <div className="text-sm text-muted-foreground">Receive email notifications for system updates</div>
//               </div>
//               <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
//             </div>
            
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="font-medium">Auto-save Settings</div>
//                 <div className="text-sm text-muted-foreground">Automatically save your preferences</div>
//               </div>
//               <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
//             </div>
            
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="font-medium">Two-factor Authentication</div>
//                 <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
//               </div>
//               <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
//             </div>
//           </div>
//         </Card.Content>
//       </Card>
//     </div>
//   );
// };

// // Main App Component
// const App = () => {
//   // Theme state and effect
//   const [theme, setTheme] = useState('system');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeSection, setActiveSection] = useState('dashboard');
  
//   // Effect to apply theme
//   useEffect(() => {
//     const root = window.document.documentElement;
    
//     // Remove existing theme classes
//     root.classList.remove('light', 'dark');
    
//     // Determine theme
//     const resolvedTheme = theme === 'system' ? 
//       window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' : 
//       theme;
    
//     // Apply theme
//     root.classList.add(resolvedTheme);
//   }, [theme]);
  
//   // Toggle theme function
//   const toggleTheme = () => {
//     setTheme(prevTheme => {
//       if (prevTheme === 'light') return 'dark';
//       if (prevTheme === 'dark') return 'system';
//       return 'light';
//     });
//   };
  
//   // Close sidebar on route change
//   const handleSectionChange = (section) => {
//     setActiveSection(section);
//     setSidebarOpen(false);
//   };
  
//   // Close sidebar when clicking overlay
//   const closeSidebar = () => {
//     setSidebarOpen(false);
//   };
  
//   // Protected route component
//   const ProtectedRoute = ({ children }) => {
//     // In a real app, you would check authentication here
//     // For demo purposes, we're assuming the user is authenticated
//     return children;
//   };
  
//   // Get current component based on active section
//   const getCurrentComponent = () => {
//     switch (activeSection) {
//       case 'dashboard': return <Dashboard />;
//       case 'students': return <Students />;
//       case 'staff': return <Staff />;
//       case 'library': return <Library />;
//       case 'attendance': return <Attendance />;
//       case 'placements': return <Placements />;
//       case 'notices': return <Notices />;
//       case 'documents': return <Documents />;
//       case 'settings': return <Settings />;
//       default: return <Dashboard />;
//     }
//   };
  
//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       <AuthContext.Provider value={{ isAuthenticated: true }}>
//         <div className="flex h-screen bg-background text-foreground">
//           {/* Sidebar */}
//           <Sidebar 
//             isOpen={sidebarOpen} 
//             onClose={closeSidebar} 
//             activeSection={activeSection}
//             onSectionChange={handleSectionChange}
//           />
          
//           {/* Main Content */}
//           <div className="flex-1 flex flex-col overflow-hidden">
//             {/* Header */}
//             <Header 
//               onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
//               theme={theme} 
//               toggleTheme={toggleTheme}
//             />
            
//             {/* Page Content */}
//             <main className="flex-1 overflow-auto p-6">
//               <ProtectedRoute>
//                 {getCurrentComponent()}
//               </ProtectedRoute>
//             </main>
//           </div>
//         </div>
//       </AuthContext.Provider>
//     </ThemeContext.Provider>
//   );
// };

// export default App;

import React from 'react'

const raw = () => {
  return (
    <div>raw</div>
  )
}

export default raw
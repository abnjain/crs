import React, { useEffect, useState } from "react";

// export default function Dashboard() {
//   const [overview, setOverview] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/overview`, {
//       headers: { Authorization: `Bearer ${token}` }
//     }).then(r=>r.json()).then(setOverview).catch(()=>{});
//   }, []);

//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Dashboard</h1>
//         <div>
//           <span className="mr-4">Hello, {user.email || user.name || "User"}</span>
//           <button onClick={() => { localStorage.clear(); window.location.href="/login"; }} className="px-3 py-1 bg-gray-200 rounded">Logout</button>
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-4">
//         <div className="p-4 bg-white rounded shadow">
//           <h3 className="text-sm text-gray-500">Users</h3>
//           <div className="text-2xl font-bold">{overview ? overview.users : "-"}</div>
//         </div>
//         <div className="p-4 bg-white rounded shadow">
//           <h3 className="text-sm text-gray-500">Students</h3>
//           <div className="text-2xl font-bold">{overview ? overview.students : "-"}</div>
//         </div>
//         <div className="p-4 bg-white rounded shadow">
//           <h3 className="text-sm text-gray-500">Teachers</h3>
//           <div className="text-2xl font-bold">{overview ? overview.teachers : "-"}</div>
//         </div>
//       </div>

//       <div className="mt-6">
//         <h2 className="text-lg font-semibold">Quick Links</h2>
//         <div className="mt-2 space-x-2">
//           <button className="px-3 py-1 bg-blue-600 text-white rounded">Students</button>
//           <button className="px-3 py-1 bg-green-600 text-white rounded">Teachers</button>
//           <button className="px-3 py-1 bg-yellow-500 text-white rounded">Library</button>
//         </div>
//       </div>
//     </div>
//   );
// }


// Dashboard Component
const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to College Central Repository System</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Card.Header>
            <Card.Title>Total Students</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">2,458</div>
            <p className="text-sm text-muted-foreground">+12% from last month</p>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Staff Members</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">142</div>
            <p className="text-sm text-muted-foreground">+3 from last month</p>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Library Books</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">12,345</div>
            <p className="text-sm text-muted-foreground">+156 added this month</p>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Placements</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">89%</div>
            <p className="text-sm text-muted-foreground">Placement rate this year</p>
          </Card.Content>
        </Card>
      </div>
      
      <Card>
        <Card.Header>
          <Card.Title>Recent Notices</Card.Title>
        </Card.Header>
        <Card.Content>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Title</Table.Head>
                <Table.Head>Date</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {[
                { id: 1, title: 'Semester Exams Schedule', date: '2023-12-01', status: 'Published' },
                { id: 2, title: 'Library Holiday Notice', date: '2023-11-28', status: 'Published' },
                { id: 3, title: 'Placement Drive Registration', date: '2023-11-25', status: 'Draft' }
              ].map((notice) => (
                <Table.Row key={notice.id}>
                  <Table.Cell>{notice.title}</Table.Cell>
                  <Table.Cell>{notice.date}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={notice.status === 'Published' ? 'default' : 'secondary'}>
                      {notice.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;

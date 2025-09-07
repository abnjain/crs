// src/pages/dashboard/StudentDashboard.jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Welcome, {user?.name}!</h2>
          <p className="text-muted-foreground">Here's what's happening in your academic life.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">87%</p>
              <p className="text-sm text-muted-foreground">Overall attendance this semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CGPA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">8.72</p>
              <p className="text-sm text-muted-foreground">Current cumulative GPA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Books currently issued</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">View Timetable</Button>
              <Button variant="outline" className="w-full">Download ID Card</Button>
              <Button variant="outline" className="w-full">Check Notices</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Assignment Submission</p>
                  <p className="text-sm text-muted-foreground">Database Systems - Due tomorrow</p>
                </div>
                <div>
                  <p className="font-medium">Book Return</p>
                  <p className="text-sm text-muted-foreground">Operating Systems - Due in 3 days</p>
                </div>
                <div>
                  <p className="font-medium">Fee Payment</p>
                  <p className="text-sm text-muted-foreground">Semester Fee - Due in 7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}


// // src/pages/dashboard/StudentDashboard.jsx
// import React, { useEffect, useState } from "react";
// import DashboardCard from "@/components/shared/DashboardCards";
// import api from "@/config/api";

// export default function StudentDashboard() {
//   const [stats, setStats] = useState({});

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await api.get("/analytics/student"); // sample
//         setStats(res.data);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchStats();
//   }, []);

//   const modules = [
//     { title: "Library", description: "Check books and resources", link: "/library", icon: "📚" },
//     { title: "Attendance", description: `You have ${stats.attendance || 0}% attendance`, link: "/attendance", icon: "📝" },
//     { title: "Exams", description: `Upcoming exams: ${stats.upcomingExams || 0}`, link: "/exams", icon: "🧪" },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
//       {/* {modules.map((m, idx) => ( */}
//         <DashboardCard modules={modules} />
//       {/* ))} */}
//     </div>
//   );
// }

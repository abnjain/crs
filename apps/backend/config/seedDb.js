import { Application, Book, Course, Department, Document, Enrollment, Exam, Job, Loan, Marks, Material, Notice, Subject, Student, Teacher, Timetable, User, Alumnus, Events } from '../models/index.js';
import { config } from './config.js';
import bcrypt from "bcrypt";
import axios from 'axios';

// Seed function
export async function seedDB() {
    try {
        console.log('Connected to DB');

        // Clear existing data
        await Promise.all([
            Department.deleteMany({}),
            Course.deleteMany({}),
            User.deleteMany({}),
            Student.deleteMany({}),
            Teacher.deleteMany({}),
            Subject.deleteMany({}),
            Enrollment.deleteMany({}),
            Timetable.deleteMany({}),
            Exam.deleteMany({}),
            Marks.deleteMany({}),
            Material.deleteMany({}),
            Book.deleteMany({}),
            Loan.deleteMany({}),
            Notice.deleteMany({}),
            Job.deleteMany({}),
            Application.deleteMany({}),
            Document.deleteMany({}),
            Alumnus.deleteMany({}),
            Events.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // 1. Insert Departments(4)
        const departments = await Department.insertMany([
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'ME', name: 'Mechanical Engineering' },
            { code: 'CE', name: 'Civil Engineering' },
            { code: 'ECE', name: 'Electronics & Communication Engineering' }
        ]);
        const deptIds = departments.map(d => d._id);

        // 2. Insert Courses (8)
        const courses = await Course.insertMany([
            { deptId: deptIds[0], code: 'BT-CSE', name: 'B.Tech in CSE', active: true, stream: 'CSE', batch: '2023', durationYears: 4, semesters: 8 },
            { deptId: deptIds[0], code: 'MT-CSE', name: 'M.Tech in CSE', active: true, stream: 'CSE', batch: '2024', durationYears: 2, semesters: 4 },
            { deptId: deptIds[1], code: 'BT-ME', name: 'B.Tech in ME', active: true, stream: 'ME', batch: '2023', durationYears: 4, semesters: 8 },
            { deptId: deptIds[1], code: 'MT-ME', name: 'M.Tech in ME', active: true, stream: 'ME', batch: '2024', durationYears: 2, semesters: 4 },
            { deptId: deptIds[2], code: 'BT-CE', name: 'B.Tech in CE', active: true, stream: 'CE', batch: '2023', durationYears: 4, semesters: 8 },
            { deptId: deptIds[2], code: 'MT-CE', name: 'M.Tech in CE', active: true, stream: 'CE', batch: '2024', durationYears: 2, semesters: 4 },
            { deptId: deptIds[3], code: 'BT-ECE', name: 'B.Tech in ECE', active: true, stream: 'ECE', batch: '2023', durationYears: 4, semesters: 8 },
            { deptId: deptIds[3], code: 'MT-ECE', name: 'M.Tech in ECE', active: true, stream: 'ECE', batch: '2024', durationYears: 2, semesters: 4 }
        ]);
        const courseIds = courses.map(c => c._id);

        const rawUsers = [
            // 10 Students
            { email: 'student1@college.edu', password: 'password', name: 'Alice Student', phone: '1234567890', roles: ['Student'] },
            { email: 'student2@college.edu', password: 'password', name: 'Bob Student', phone: '1234567891', roles: ['Student'] },
            { email: 'student3@college.edu', password: 'password', name: 'Charlie Student', phone: '1234567892', roles: ['Student'] },
            { email: 'student4@college.edu', password: 'password', name: 'Dana Student', phone: '1234567893', roles: ['Student'] },
            { email: 'student5@college.edu', password: 'password', name: 'Eve Student', phone: '1234567894', roles: ['Student'] },
            { email: 'student6@college.edu', password: 'password', name: 'Frank Student', phone: '1234567895', roles: ['Student'] },
            { email: 'student7@college.edu', password: 'password', name: 'Grace Student', phone: '1234567896', roles: ['Student'] },
            { email: 'student8@college.edu', password: 'password', name: 'Henry Student', phone: '1234567897', roles: ['Student'] },
            { email: 'student9@college.edu', password: 'password', name: 'Ivy Student', phone: '1234567898', roles: ['Student'] },
            { email: 'student10@college.edu', password: 'password', name: 'Jack Student', phone: '1234567899', roles: ['Student'] },
            // 5 Teachers
            { email: 'teacher1@college.edu', password: 'password', name: 'Dr. Smith Teacher', phone: '9876543210', roles: ['Teacher'] },
            { email: 'teacher2@college.edu', password: 'password', name: 'Prof. Johnson Teacher', phone: '9876543211', roles: ['Teacher'] },
            { email: 'teacher3@college.edu', password: 'password', name: 'Ms. Lee Teacher', phone: '9876543212', roles: ['Teacher'] },
            { email: 'teacher4@college.edu', password: 'password', name: 'Mr. Kim Teacher', phone: '9876543213', roles: ['Teacher'] },
            { email: 'teacher5@college.edu', password: 'password', name: 'Dr. Patel Teacher', phone: '9876543214', roles: ['Teacher'] },
            // 5 Staff
            { email: 'staff1@college.edu', password: 'password', name: 'Admin Staff1', phone: '5550000001', roles: ['Staff'] },
            { email: 'staff2@college.edu', password: 'password', name: 'Admin Staff2', phone: '5550000002', roles: ['Staff'] },
            { email: 'staff3@college.edu', password: 'password', name: 'Admin Staff3', phone: '5550000003', roles: ['Staff'] },
            { email: 'staff4@college.edu', password: 'password', name: 'Admin Staff4', phone: '5550000004', roles: ['Staff'] },
            { email: 'staff5@college.edu', password: 'password', name: 'Admin Staff5', phone: '5550000005', roles: ['Staff'] },
            // 2 Librarians
            { email: 'librarian1@college.edu', password: 'password', name: 'Librarian One', phone: '4441111111', roles: ['Librarian'] },
            { email: 'librarian2@college.edu', password: 'password', name: 'Librarian Two', phone: '4441111112', roles: ['Librarian'] },
            // 2 Placement
            { email: 'placement1@college.edu', password: 'password', name: 'Placement Officer1', phone: '3332222221', roles: ['Placement'] },
            { email: 'placement2@college.edu', password: 'password', name: 'Placement Officer2', phone: '3332222222', roles: ['Placement'] },
            // 3 Admins
            { email: 'admin1@college.edu', password: 'password', name: 'Admin One', phone: '2223333331', roles: ['Admin'] },
            { email: 'admin2@college.edu', password: 'password', name: 'Admin Two', phone: '2223333332', roles: ['Admin'] },
            { email: 'admin3@college.edu', password: 'password', name: 'Admin Three', phone: '2223333333', roles: ['Admin'] },
            // 1 SuperAdmin
            { email: 'superadmin@college.edu', password: 'password', name: 'Super Admin', phone: '1110000001', roles: ['SuperAdmin'] }
        ];

        const hashedUsers = await Promise.all(
            rawUsers.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10)
            }))
        );

        // 3. Insert Users (30)
        const users = await User
            // .find({})
            .insertMany(hashedUsers);
        const userIds = users.map(u => u._id);
        const studentUserIds = userIds.slice(0, 10);
        const teacherUserIds = userIds.slice(10, 15);
        const staffUserIds = userIds.slice(15, 20);
        const librarianUserIds = userIds.slice(20, 22);
        const placementUserIds = userIds.slice(22, 24);
        const adminUserIds = userIds.slice(24, 27);
        const superAdminUserId = userIds[27];

        // 4. Insert Students (10) - Include new alumni fields
        const students = await Student
            // .find({});
            .insertMany(studentUserIds.map((userId, i) => ({
                _id: userId, // Use same ID as User
                user: userId,
                rollNo: `R00${i + 1}`,
                admissionYear: 2023,
                courseId: courseIds[i % courseIds.length],
                enrollmentNo: `E00${i + 1}`,
                section: i % 2 === 0 ? 'A' : 'B',
                dob: new Date(`2000-01-0${i + 1}`),
                address: `Address ${i + 1}`,
                guardian: `Guardian ${i + 1}`,
                meta: { notes: 'Dummy meta' },
                // Set default alumni status
                alumniStatus: 'current',
                graduationDate: null
            })));
        const studentIds = students.map(s => s._id);

        // 5. Insert Teachers (5)
        const teachers = await Teacher.insertMany(teacherUserIds.map((userId, i) => ({
            _id: userId,
            user: userId,
            empCode: `EMP0${i + 1}`,
            deptId: deptIds[i % deptIds.length],
            designation: 'Assistant Professor',
            expertise: [`Subject ${i + 1}`],
            achievements: [`Award ${i + 1}`]
        })));
        const teacherIds = teachers.map(t => t._id);

        // 6. Insert Subjects (20)
        const subjects = [];
        for (let i = 0; i < 20; i++) {
            subjects.push({
                courseId: courseIds[i % courseIds.length],
                code: `SUB${(i + 1).toString().padStart(3, '0')}`,
                name: `Subject ${i + 1}`,
                semester: (i % 8) + 1,
                credits: 4
            });
        }
        const insertedSubjects = await Subject.insertMany(subjects);
        const subjectIds = insertedSubjects.map(s => s._id);

        // 7. Insert Enrollments (10)
        const enrollments = await Enrollment.insertMany(studentIds.map((studentId, i) => ({
            studentId,
            courseId: courseIds[i % courseIds.length],
            semester: 1,
            section: 'A',
            subjects: subjectIds.slice(i * 2, (i * 2) + 2),
            year: 2025
        })));

        // 8. Insert Timetables (2)
        const timetables = await Timetable.insertMany([
            {
                courseId: courseIds[0],
                semester: 1,
                section: 'A',
                week: [
                    { day: 'Monday', slots: [{ start: '09:00', end: '10:00', subjectId: subjectIds[0], teacherId: teacherIds[0] }] }
                ],
                validFrom: new Date('2025-09-01'),
                validTo: new Date('2025-12-31')
            },
            {
                courseId: courseIds[1],
                semester: 1,
                section: 'B',
                week: [
                    { day: 'Tuesday', slots: [{ start: '10:00', end: '11:00', subjectId: subjectIds[1], teacherId: teacherIds[1] }] }
                ],
                validFrom: new Date('2025-09-01'),
                validTo: new Date('2025-12-31')
            }
        ]);

        // 10. Insert Exams (10)
        const exams = [];
        for (let i = 0; i < 10; i++) {
            exams.push({
                subjectId: subjectIds[i % subjectIds.length],
                name: `Exam ${i + 1}`,
                type: ['midterm', 'final', 'quiz'][i % 3],
                date: new Date(`2025-10-${i + 1}`),
                maxMarks: 100
            });
        }
        const insertedExams = await Exam.insertMany(exams);
        const examIds = insertedExams.map(e => e._id);

        // 11. Insert Marks (80)
        const marks = [];
        for (let e = 0; e < examIds.length; e++) {
            const exam = await Exam.findById(examIds[e]);
            const examMaxMarks = exam ? exam.maxMarks : 100;

            for (let s = 0; s < 8; s++) {
                const obtainedMarks = Math.floor(Math.random() * examMaxMarks) + 1;
                marks.push({
                    examId: examIds[e],
                    studentId: studentIds[s % studentIds.length],
                    marksObtained: obtainedMarks,
                    maxMarks: examMaxMarks,
                    grade: Math.random() > 0.5 ? 'A' : 'B',
                    enteredBy: teacherIds[e % teacherIds.length]
                });
            }
        }
        await Marks.insertMany(marks);

        // 12. Insert Materials (10)
        const materials = [];
        for (let i = 0; i < 10; i++) {
            materials.push({
                subjectId: subjectIds[i % subjectIds.length],
                teacherId: teacherIds[i % teacherIds.length],
                title: `Material ${i + 1}`,
                fileKey: `file${i + 1}.pdf`,
                mime: 'application/pdf',
                meta: { size: 1024 },
                publishedAt: new Date('2025-09-18')
            });
        }
        await Material.insertMany(materials);

        // 13. Insert Books (20)
        const books = [];
        for (let i = 0; i < 20; i++) {
            const totalCopies = Math.floor(Math.random() * 5) + 1;
            const availableCopies = Math.floor(Math.random() * totalCopies) + 1;

            books.push({
                isbn: `ISBN${(i + 1).toString().padStart(10, '0')}`,
                title: `Book Title ${i + 1}`,
                authors: [`Author ${i + 1}`],
                subjects: [`Subject ${i + 1}`],
                publisher: 'Publisher Inc',
                year: 2020 + (i % 5),
                copiesTotal: totalCopies,
                copiesAvailable: availableCopies,
                tags: ['tag1', 'tag2']
            });
        }
        const insertedBooks = await Book.insertMany(books);
        const bookIds = insertedBooks.map(b => b._id);

        // 14. Insert Loans (10)
        const loans = [];
        for (let i = 0; i < 10; i++) {
            loans.push({
                bookId: bookIds[i % bookIds.length],
                userId: userIds[i % userIds.length],
                issuedOn: new Date('2025-09-01'),
                dueOn: new Date('2025-09-30'),
                returnedOn: i % 2 === 0 ? new Date('2025-09-15') : null,
                fineAccrued: i % 2 === 0 ? 0 : 50
            });
        }
        await Loan.insertMany(loans);

        // 15. Insert Notices (5)
        const notices = await Notice.insertMany([
            { title: 'Holiday Notice', body: 'College closed on Sep 20', audience: ['all'], createdBy: superAdminUserId, publishAt: new Date('2025-09-18'), expiresAt: new Date('2025-09-25'), pinned: true },
            { title: 'Exam Schedule', body: 'Midterms start Oct 1', audience: ['students'], createdBy: adminUserIds[0], publishAt: new Date('2025-09-18'), expiresAt: new Date('2025-10-01') },
            { title: 'Faculty Meeting', body: 'Meeting on Sep 22', audience: ['teachers'], createdBy: adminUserIds[1], publishAt: new Date('2025-09-18'), expiresAt: new Date('2025-09-23') },
            { title: 'Library Update', body: 'New books added', audience: ['all'], createdBy: librarianUserIds[0], publishAt: new Date('2025-09-18'), expiresAt: new Date('2025-10-18') },
            { title: 'Placement Drive', body: 'Drive on Oct 5', audience: ['students'], createdBy: placementUserIds[0], publishAt: new Date('2025-09-18'), expiresAt: new Date('2025-10-06') }
        ]);

        // 16. Insert Jobs (5)
        const jobs = await Job.insertMany([
            { title: 'Software Engineer', company: 'Tech Corp', location: 'City1', description: 'Dev role', eligibility: { cgpa: 7.0 }, deadline: new Date('2025-10-01'), postedBy: placementUserIds[0] },
            { title: 'Data Analyst', company: 'Data Inc', location: 'City2', description: 'Analysis role', eligibility: { cgpa: 6.5 }, deadline: new Date('2025-10-15'), postedBy: placementUserIds[1] },
            { title: 'Mechanical Engineer', company: 'Mech Ltd', location: 'City3', description: 'Eng role', eligibility: { cgpa: 7.5 }, deadline: new Date('2025-11-01'), postedBy: placementUserIds[0] },
            { title: 'Civil Designer', company: 'Build Co', location: 'City4', description: 'Design role', eligibility: { cgpa: 6.0 }, deadline: new Date('2025-11-15'), postedBy: placementUserIds[1] },
            { title: 'Electronics Tech', company: 'Electro Inc', location: 'City5', description: 'Tech role', eligibility: { cgpa: 7.0 }, deadline: new Date('2025-12-01'), postedBy: placementUserIds[0] }
        ]);
        const jobIds = jobs.map(j => j._id);

        // 17. Insert Applications (10)
        const applications = [];
        for (let i = 0; i < 10; i++) {
            applications.push({
                jobId: jobIds[i % jobIds.length],
                studentId: studentIds[i % studentIds.length],
                resumeKey: `resume${i + 1}.pdf`,
                status: ['pending', 'applied', 'shortlisted'][i % 3],
                appliedAt: new Date('2025-09-20')
            });
        }
        await Application.insertMany(applications);

        // 18. Insert Documents (5)
        const documents = await Document.insertMany([
            { title: 'Syllabus CSE', type: 'syllabus', ownerId: teacherUserIds[0], visibility: { type: 'public' }, currentVersion: { fileKey: 'syl1.pdf', size: 1024, uploadedAt: new Date('2025-09-18') }, versions: [], tags: ['cse'] },
            { title: 'Circular 1', type: 'circular', ownerId: adminUserIds[0], visibility: { type: 'restricted', roles: ['Student'] }, currentVersion: { fileKey: 'circ1.pdf', size: 512, uploadedAt: new Date('2025-09-18') }, versions: [], tags: ['admin'] },
            { title: 'Notes Math', type: 'notes', ownerId: teacherUserIds[1], visibility: { type: 'public' }, currentVersion: { fileKey: 'notes1.pdf', size: 2048, uploadedAt: new Date('2025-09-18') }, versions: [], tags: ['math'] },
            { title: 'Paper Physics', type: 'paper', ownerId: teacherUserIds[2], visibility: { type: 'restricted', deptIds: [deptIds[0]] }, currentVersion: { fileKey: 'paper1.pdf', size: 1024, uploadedAt: new Date('2025-09-18') }, versions: [], tags: ['physics'] },
            { title: 'Research AI', type: 'researches', ownerId: teacherUserIds[3], visibility: { type: 'public' }, currentVersion: { fileKey: 'res1.pdf', size: 4096, uploadedAt: new Date('2025-09-18') }, versions: [], tags: ['ai'] }
        ]);

        // 19. Insert Alumni (8) - Create alumni for first 8 students
        console.log('Seeding Alumni...');
        const alumnus = [
            // Alice Student - Software Engineer at TechCorp
            {
                name: 'Alice Student',
                email: 'alice@techcorp.com',
                phone: '9876543210',
                studentId: studentIds[0],
                _id: studentIds[0],
                enrollmentNo: 'E001',
                batch: '2023',
                department: 'CSE',
                degree: 'B.Tech',
                specialization: 'Computer Science',
                graduationYear: 2027,
                currentCompany: 'TechCorp',
                currentRole: 'Employee',
                currentDesignation: 'Software Engineer',
                linkedin: 'https://linkedin.com/in/alice-student',
                location: 'Bangalore, India',
                about: 'Full-stack developer passionate about AI and machine learning. 2+ years experience in web development.',
                experiences: [
                    {
                        company: 'TechCorp',
                        role: 'Software Engineer',
                        startDate: new Date('2027-06-01'),
                        currentlyWorking: true,
                        description: 'Developing scalable web applications using React and Node.js'
                    },
                    {
                        company: 'Internship Co.',
                        role: 'Software Intern',
                        startDate: new Date('2026-06-01'),
                        endDate: new Date('2026-12-01'),
                        currentlyWorking: false,
                        description: 'Worked on backend development and database optimization'
                    }
                ],
                tags: ['software', 'developer', 'react', 'node.js', 'ai'],
                createdBy: adminUserIds[0],
                visibility: 'public'
            },

            // Bob Student - Data Scientist at DataAnalytics Inc
            {
                name: 'Bob Student',
                email: 'bob@dataanalytics.com',
                phone: '9876543211',
                studentId: studentIds[1],
                _id: studentIds[1],
                enrollmentNo: 'E002',
                batch: '2023',
                department: 'CSE',
                degree: 'B.Tech',
                specialization: 'Data Science',
                graduationYear: 2027,
                currentCompany: 'DataAnalytics Inc',
                currentRole: 'Employee',
                currentDesignation: 'Data Scientist',
                linkedin: 'https://linkedin.com/in/bob-student',
                location: 'Hyderabad, India',
                about: 'Data enthusiast specializing in machine learning and predictive analytics.',
                experiences: [
                    {
                        company: 'DataAnalytics Inc',
                        role: 'Data Scientist',
                        startDate: new Date('2027-07-01'),
                        currentlyWorking: true,
                        description: 'Building ML models for business intelligence and forecasting'
                    }
                ],
                tags: ['data-science', 'machine-learning', 'python', 'analytics'],
                createdBy: adminUserIds[0],
                visibility: 'public'
            },

            // Charlie Student - Mechanical Design Engineer at MechWorks
            {
                name: 'Charlie Student',
                email: 'charlie@mechworks.com',
                phone: '9876543212',
                studentId: studentIds[2],
                _id: studentIds[2],
                enrollmentNo: 'E003',
                batch: '2023',
                department: 'ME',
                degree: 'B.Tech',
                specialization: 'Mechanical Engineering',
                graduationYear: 2027,
                currentCompany: 'MechWorks Ltd',
                currentRole: 'Employee',
                currentDesignation: 'Design Engineer',
                linkedin: 'https://linkedin.com/in/charlie-student',
                location: 'Chennai, India',
                about: 'CAD specialist with expertise in product design and manufacturing processes.',
                experiences: [
                    {
                        company: 'MechWorks Ltd',
                        role: 'Design Engineer',
                        startDate: new Date('2027-08-01'),
                        currentlyWorking: true,
                        description: 'Designing mechanical components using SolidWorks and AutoCAD'
                    },
                    {
                        company: 'Auto Parts Co.',
                        role: 'Junior Engineer',
                        startDate: new Date('2027-01-01'),
                        endDate: new Date('2027-07-31'),
                        currentlyWorking: false,
                        description: 'Assisted in automotive part design and testing'
                    }
                ],
                tags: ['mechanical', 'cad', 'solidworks', 'manufacturing'],
                createdBy: adminUserIds[0],
                visibility: 'public'
            },

            // Dana Student - Civil Engineer at BuildCorp
            {
                name: 'Dana Student',
                email: 'dana@buildcorp.com',
                phone: '9876543213',
                studentId: studentIds[3],
                _id: studentIds[3],
                enrollmentNo: 'E004',
                batch: '2023',
                department: 'CE',
                degree: 'B.Tech',
                specialization: 'Civil Engineering',
                graduationYear: 2027,
                currentCompany: 'BuildCorp',
                currentRole: 'Employee',
                currentDesignation: 'Site Engineer',
                linkedin: 'https://linkedin.com/in/dana-student',
                location: 'Mumbai, India',
                about: 'Experienced in construction management and structural analysis.',
                experiences: [
                    {
                        company: 'BuildCorp',
                        role: 'Site Engineer',
                        startDate: new Date('2027-06-15'),
                        currentlyWorking: true,
                        description: 'Managing construction projects and ensuring quality standards'
                    }
                ],
                tags: ['civil', 'construction', 'project-management', 'structural'],
                createdBy: adminUserIds[0],
                visibility: 'public'
            },

            // Eve Student - Embedded Systems Engineer at ElectroTech
            {
                name: 'Eve Student',
                email: 'eve@electrotech.com',
                phone: '9876543214',
                studentId: studentIds[4],
                _id: studentIds[4],
                enrollmentNo: 'E005',
                batch: '2023',
                department: 'ECE',
                degree: 'B.Tech',
                specialization: 'Electronics & Communication',
                graduationYear: 2027,
                currentCompany: 'ElectroTech Solutions',
                currentRole: 'Employee',
                currentDesignation: 'Embedded Systems Engineer',
                linkedin: 'https://linkedin.com/in/eve-student',
                location: 'Pune, India',
                about: 'Embedded systems developer with focus on IoT and firmware development.',
                experiences: [
                    {
                        company: 'ElectroTech Solutions',
                        role: 'Embedded Systems Engineer',
                        startDate: new Date('2027-07-15'),
                        currentlyWorking: true,
                        description: 'Developing firmware for IoT devices and embedded systems'
                    },
                    {
                        company: 'TechStartups',
                        role: 'Intern',
                        startDate: new Date('2026-05-01'),
                        endDate: new Date('2026-08-01'),
                        currentlyWorking: false,
                        description: 'Worked on hardware prototyping and testing'
                    }
                ],
                tags: ['embedded', 'iot', 'firmware', 'electronics'],
                createdBy: adminUserIds[0],
                visibility: 'public'
            },

            // Frank Student - DevOps Engineer at CloudScale
            {
                name: 'Frank Student',
                email: 'frank@cloudscale.com',
                phone: '9876543215',
                studentId: studentIds[5],
                _id: studentIds[5],
                enrollmentNo: 'E006',
                batch: '2023',
                department: 'CSE',
                degree: 'B.Tech',
                specialization: 'Computer Science',
                graduationYear: 2027,
                currentCompany: 'CloudScale Technologies',
                currentRole: 'Employee',
                currentDesignation: 'DevOps Engineer',
                linkedin: 'https://linkedin.com/in/frank-student',
                location: 'Noida, India',
                about: 'DevOps professional specializing in CI/CD pipelines and cloud infrastructure.',
                experiences: [
                    {
                        company: 'CloudScale Technologies',
                        role: 'DevOps Engineer',
                        startDate: new Date('2027-08-01'),
                        currentlyWorking: true,
                        description: 'Managing AWS infrastructure and automation pipelines'
                    }
                ],
                tags: ['devops', 'aws', 'ci-cd', 'docker', 'kubernetes'],
                createdBy: adminUserIds[0],
                visibility: 'public'
            },

            // Grace Student - Project Manager at ConsultPro
            {
                name: 'Grace Student',
                email: 'grace@consultpro.com',
                phone: '9876543216',
                studentId: studentIds[6],
                _id: studentIds[6],
                enrollmentNo: 'E007',
                batch: '2023',
                department: 'CSE',
                degree: 'B.Tech',
                specialization: 'Information Technology',
                graduationYear: 2027,
                currentCompany: 'ConsultPro Services',
                currentRole: 'Employee',
                currentDesignation: 'Project Manager',
                linkedin: 'https://linkedin.com/in/grace-student',
                location: 'Delhi, India',
                about: 'Agile project manager with experience in software development projects.',
                experiences: [
                    {
                        company: 'ConsultPro Services',
                        role: 'Project Manager',
                        startDate: new Date('2027-09-01'),
                        currentlyWorking: true,
                        description: 'Leading software development teams and managing client projects'
                    },
                    {
                        company: 'TechConsult',
                        role: 'Business Analyst',
                        startDate: new Date('2027-01-01'),
                        endDate: new Date('2027-08-31'),
                        currentlyWorking: false,
                        description: 'Requirements gathering and process documentation'
                    }
                ],
                tags: ['project-management', 'agile', 'scrum', 'business-analysis'],
                createdBy: adminUserIds[0],
                visibility: 'public'
            },

            // Henry Student - Quality Assurance Engineer at QualitySoft
            {
                name: 'Henry Student',
                email: 'henry@qualitysoft.com',
                phone: '9876543217',
                studentId: studentIds[7],
                _id: studentIds[7],
                enrollmentNo: 'E008',
                batch: '2023',
                department: 'CSE',
                degree: 'B.Tech',
                specialization: 'Software Engineering',
                graduationYear: 2027,
                currentCompany: 'QualitySoft Solutions',
                currentRole: 'Employee',
                currentDesignation: 'QA Engineer',
                linkedin: 'https://linkedin.com/in/henry-student',
                location: 'Gurgaon, India',
                about: 'Quality assurance specialist with expertise in automation testing.',
                experiences: [
                    {
                        company: 'QualitySoft Solutions',
                        role: 'QA Engineer',
                        startDate: new Date('2027-06-20'),
                        currentlyWorking: true,
                        description: 'Automated testing using Selenium and Cypress'
                    }
                ],
                tags: ['qa', 'testing', 'automation', 'selenium', 'cypress'],
                createdBy: adminUserIds[0],
                visibility: 'public'
            }
        ];
        const alumniData = await Alumnus.insertMany(alumnus);

        const alumniIds = alumniData.map(a => a._id);

        // FIXED: Update each student individually to link with their corresponding alumni
        console.log('Linking students to alumni...');

        // Update students 1-8 to mark as alumni and link to their specific alumni record
        for (let i = 0; i < 8; i++) {
            // Update Student document
            await Student.updateOne(
                { _id: studentIds[i] },
                {
                    $set: {
                        alumniStatus: 'alumni',
                        alumniId: alumniIds[i],
                        graduationDate: new Date('2027-05-15')
                    }
                }
            );

            // Update User document to add Alumni role
            await User.updateOne(
                { _id: studentUserIds[i] },
                {
                    $addToSet: { roles: 'Alumni' }
                }
            );
        }

        // Keep students 9-10 as current students
        for (let i = 8; i < 10; i++) {
            await Student.updateOne(
                { _id: studentIds[i] },
                {
                    $set: {
                        alumniStatus: 'current',
                        graduationDate: null
                    }
                }
            );
        }

        // Update User emails for alumni(professional emails)
        console.log('Updating user emails for alumni...');
        await Promise.all([
            User.updateOne({ _id: studentUserIds[0] }, { email: 'alice@techcorp.com' }),
            User.updateOne({ _id: studentUserIds[1] }, { email: 'bob@dataanalytics.com' }),
            User.updateOne({ _id: studentUserIds[2] }, { email: 'charlie@mechworks.com' }),
            User.updateOne({ _id: studentUserIds[3] }, { email: 'dana@buildcorp.com' }),
            User.updateOne({ _id: studentUserIds[4] }, { email: 'eve@electrotech.com' }),
            User.updateOne({ _id: studentUserIds[5] }, { email: 'frank@cloudscale.com' }),
            User.updateOne({ _id: studentUserIds[6] }, { email: 'grace@consultpro.com' }),
            User.updateOne({ _id: studentUserIds[7] }, { email: 'henry@qualitysoft.com' })
        ]);

        console.log(`Inserted ${alumniData.length} alumni records and linked ${alumniIds.length} students to their alumni profiles`);

        // 20. Insert Events (5)
        try {
            // Fetch 10 random images from Picsum
            const { data: picsumImages } = await axios.get("https://picsum.photos/v2/list?page=1&limit=20");

            // Generate events data with random photos
            const eventsData = [
                {
                    title: 'Tech Fest 2025',
                    description: 'Annual tech festival with workshops, competitions, and exhibitions.',
                    startDate: new Date('2025-10-10T09:00:00'),
                    endDate: new Date('2025-10-12T18:00:00'),
                    location: 'Main Campus Grounds',
                    audience: ['alumni', 'teachers'],
                    createdBy: adminUserIds[0],
                    tags: ['tech', 'festival', 'workshops'],
                    isPublic: true,
                    photos: [picsumImages[0].download_url, picsumImages[1].download_url, picsumImages[18].download_url, picsumImages[19].download_url],
                },
                {
                    title: 'Alumni Meet 2025',
                    description: 'Gathering of all alumni with networking sessions and keynote speeches.',
                    startDate: new Date('2025-11-05T10:00:00'),
                    endDate: new Date('2025-11-05T16:00:00'),
                    location: 'Auditorium',
                    audience: ['alumni', 'teachers'],
                    createdBy: adminUserIds[1],
                    tags: ['alumni', 'networking'],
                    isPublic: true,
                    photos: [picsumImages[2].download_url, picsumImages[3].download_url, picsumImages[15].download_url, picsumImages[16].download_url],
                },
                {
                    title: 'Coding Hackathon',
                    description: '24-hour hackathon for CSE and IT alumni with exciting prizes.',
                    startDate: new Date('2025-10-20T08:00:00'),
                    endDate: new Date('2025-10-21T08:00:00'),
                    location: 'Computer Lab 1',
                    audience: ['alumni'],
                    createdBy: teacherUserIds[0],
                    tags: ['coding', 'hackathon', 'competition'],
                    isPublic: true,
                    photos: [picsumImages[4].download_url, picsumImages[5].download_url],
                },
                {
                    title: 'Guest Lecture: AI in Healthcare',
                    description: 'Expert talk on AI applications in medical sciences.',
                    startDate: new Date('2025-10-25T14:00:00'),
                    endDate: new Date('2025-10-25T16:00:00'),
                    location: 'Seminar Hall 2',
                    audience: ['alumni', 'teachers'],
                    createdBy: teacherUserIds[1],
                    tags: ['lecture', 'ai', 'healthcare'],
                    isPublic: true,
                    photos: [picsumImages[12].download_url, picsumImages[13].download_url, picsumImages[14].download_url, picsumImages[15].download_url],
                },
                {
                    title: 'Cultural Night 2025',
                    description: 'Annual cultural night with dance, music, and drama performances.',
                    startDate: new Date('2025-12-15T18:00:00'),
                    endDate: new Date('2025-12-15T22:00:00'),
                    location: 'Open Stage',
                    audience: ['all'],
                    createdBy: adminUserIds[2],
                    tags: ['cultural', 'music', 'dance', 'drama'],
                    isPublic: true,
                    photos: [picsumImages[8].download_url, picsumImages[9].download_url, picsumImages[10].download_url, picsumImages[11].download_url],
                },
            ];

            const events = await Events.insertMany(eventsData);
            console.log("✅ Events inserted successfully:", events.length);
            console.log(`Inserted ${events.length} dummy events`);
        } catch (error) {
            console.error("❌ Error inserting events:", error.message);
        }

        console.log('Dummy data inserted successfully!');
    } catch (error) {
        console.error('Error seeding DB:', error);
    } finally {
        console.log('Disconnected from DB');
    }
}
import { CommunityIcon, UserIcon, CalendarIcon, BookIcon, DocumentIcon, MessageIcon, ShieldIcon, SearchIcon } from '../common/svgs';

const modules = [
  {
    icon: <CommunityIcon size={24} />,
    title: 'Alumni Directory',
    desc: 'Search and connect with alumni by graduation year, department, or employer. Manage recruitment profiles and privacy settings.',
    access: 'Alumni · Faculty · Admin',
  },
  {
    icon: <UserIcon size={24} />,
    title: 'Faculty Profiles',
    desc: 'Browse faculty bios, publications, and expertise. Faculty can upload and share papers with colleagues.',
    access: 'All Registered Users',
  },
  {
    icon: <CalendarIcon size={24} />,
    title: 'Events',
    desc: 'View, RSVP, and track college events. Admins and Faculty create events, upload media, and generate attendance reports.',
    access: 'Public view available',
  },
  {
    icon: <BookIcon size={24} />,
    title: 'Library',
    desc: 'Search the catalog, check availability, and borrow resources. Receive automated email reminders for due dates.',
    access: 'Faculty · Alumni · Admin',
  },
  {
    icon: <DocumentIcon size={24} />,
    title: 'Documents',
    desc: 'Upload and access institutional resources with role-based permissions and version tracking.',
    access: 'Faculty · Admin',
  },
  {
    icon: <MessageIcon size={24} />,
    title: 'Messaging',
    desc: 'Direct messaging between alumni and faculty. Threaded conversations with email notifications and read receipts.',
    access: 'Alumni · Faculty',
  },
  {
    icon: <ShieldIcon size={24} />,
    title: 'Admin Panel',
    desc: 'Full governance of users, content, and system settings. Audit logs, user provisioning, RBAC control, and system health monitoring.',
    access: 'Admin Only',
  },
  {
    icon: <SearchIcon size={24} />,
    title: 'Global Search',
    desc: 'Search across all modules — alumni, faculty, documents, events, and library — from a single unified interface.',
    access: 'All Registered Users',
  },
];

export function ModulesSection() {
  return (
    <section className="section" id="modules" aria-labelledby="modules-h">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">Platform Modules</div>
          <h2 className="section-title" id="modules-h">
            What CRS Offers
          </h2>
          <p className="section-desc">
            Role-based access ensures every user sees only what they are authorised to view. Sign in
            to access your personalised module dashboard.
          </p>
        </div>

        <div className="module-grid" role="list" aria-label="Available modules">
          {modules.map((mod) => (
            <div key={mod.title} className="module-card" role="listitem">
              <div className="module-icon" aria-hidden="true">
                {mod.icon}
              </div>
              <div className="module-title">{mod.title}</div>
              <p className="module-desc">{mod.desc}</p>
              <div className="module-access">
                <ShieldIcon size={14} aria-hidden />
                {mod.access}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

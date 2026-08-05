export const DEMO_PROFILE = {
  id: 'guest-user',
  full_name: 'Alex Morgan',
  university: 'Northbridge University',
  year_of_study: '3rd Year',
  bio: 'Product-minded builder looking for thoughtful collaborators in web and design.',
  skills: ['React', 'TypeScript', 'Product Design'],
}

export const DEMO_STUDENTS = [
  DEMO_PROFILE,
  {
    id: 'demo-student-1',
    full_name: 'Maya Chen',
    university: 'Northbridge University',
    year_of_study: '4th Year',
    bio: 'Design researcher who enjoys turning messy problems into clear, useful products.',
    skills: ['Figma', 'User Research', 'Branding'],
  },
  {
    id: 'demo-student-2',
    full_name: 'Jordan Ellis',
    university: 'Westfield College',
    year_of_study: '2nd Year',
    bio: 'Full-stack developer building tools for student communities and local businesses.',
    skills: ['Node.js', 'Python', 'PostgreSQL'],
  },
  {
    id: 'demo-student-3',
    full_name: 'Priya Shah',
    university: 'Northbridge University',
    year_of_study: 'Graduate',
    bio: 'Growth-minded marketer who likes early ideas, honest feedback, and useful experiments.',
    skills: ['Marketing', 'Content', 'Analytics'],
  },
]

export const DEMO_PROJECTS = [
  {
    id: 'demo-project-1',
    title: 'Campus Exchange',
    description: 'A trusted place for students to exchange equipment, books, and practical advice.',
    skills_needed: ['Product Design', 'React', 'Research'],
    creator_id: 'demo-student-1',
    members: ['demo-student-1', 'guest-user'],
    status: 'open',
    created_at: '2026-07-28T10:00:00.000Z',
  },
  {
    id: 'demo-project-2',
    title: 'Study Sprint',
    description: 'A lightweight study-room scheduler for people who work better with a little structure.',
    skills_needed: ['Node.js', 'UI Design'],
    creator_id: 'demo-student-2',
    members: ['demo-student-2'],
    status: 'open',
    created_at: '2026-07-24T10:00:00.000Z',
  },
  {
    id: 'demo-project-3',
    title: 'Local Makers Map',
    description: 'A directory connecting student makers with workshops, mentors, and small businesses nearby.',
    skills_needed: ['Marketing', 'Mapping', 'Content'],
    creator_id: 'demo-student-3',
    members: ['demo-student-3'],
    status: 'open',
    created_at: '2026-07-19T10:00:00.000Z',
  },
]

export const DEMO_PITCHES = [
  {
    id: 'demo-pitch-1',
    title: 'A calmer way to find campus events',
    description: 'A focused weekly digest that helps students find the few events worth their time.',
    skills_needed: ['Product Design', 'Content'],
    creator_id: 'demo-student-1',
    revealed: true,
    upvotes: 18,
    created_at: '2026-07-30T10:00:00.000Z',
    creator_profile: { full_name: 'Maya Chen' },
  },
  {
    id: 'demo-pitch-2',
    title: 'Borrow before you buy',
    description: 'A simple lending network for equipment that students only need once or twice a semester.',
    skills_needed: ['React', 'Research'],
    creator_id: 'guest-user',
    revealed: false,
    upvotes: 11,
    created_at: '2026-07-26T10:00:00.000Z',
  },
]

export const DEMO_CONVERSATIONS = [
  {
    otherUserId: 'demo-student-1',
    otherUserName: 'Maya Chen',
    lastMessage: 'I added a first pass of the project flow.',
    lastMessageTime: '2026-07-31T10:00:00.000Z',
    unreadCount: 2,
  },
  {
    otherUserId: 'demo-student-2',
    otherUserName: 'Jordan Ellis',
    lastMessage: 'The prototype is ready for a quick review.',
    lastMessageTime: '2026-07-29T10:00:00.000Z',
    unreadCount: 0,
  },
]

export const DEMO_MESSAGES = [
  {
    id: 'demo-message-1',
    sender_id: 'demo-student-1',
    receiver_id: 'guest-user',
    content: 'I added a first pass of the project flow.',
    read: false,
    created_at: '2026-07-31T10:00:00.000Z',
  },
]

export const DEMO_ACTIVITIES = [
  { type: 'project', title: 'Joined “Campus Exchange”', time: '2026-07-28T10:00:00.000Z', icon: '↗', date: new Date('2026-07-28T10:00:00.000Z') },
  { type: 'idea', title: 'Pitched “Borrow before you buy”', time: '2026-07-26T10:00:00.000Z', icon: '✦', date: new Date('2026-07-26T10:00:00.000Z') },
]

export const DEMO_RECOMMENDATIONS = [
  { ...DEMO_STUDENTS[1], commonSkills: ['Product Design'] },
  { ...DEMO_STUDENTS[2], commonSkills: ['React'] },
]

// Shared mock data store for demo purposes
// In production, this would be replaced with database calls

export const tasks = [
  { id: '1', title: 'Review quarterly report', due_date: 'May 23', done: false },
  { id: '2', title: 'Send invoice to client', due_date: 'May 24', done: false },
  { id: '3', title: 'Update project timeline', due_date: 'May 25', done: true },
]

export const reminders = [
  { id: '1', title: 'Call Mom', remind_at: '6:00 PM', done: false },
  { id: '2', title: 'Take medication', remind_at: '9:00 AM', done: true },
  { id: '3', title: 'Water plants', remind_at: '7:00 PM', done: false },
]

export const bills = [
  { id: '1', title: 'Electricity', amount: 85.50, due_date: 'May 28', paid: false },
  { id: '2', title: 'Internet', amount: 65.00, due_date: 'May 30', paid: false },
  { id: '3', title: 'Phone', amount: 45.00, due_date: 'May 25', paid: true },
]

export const events = [
  { id: '1', title: 'Team standup', date: 'May 23', notes: 'Weekly sync' },
  { id: '2', title: 'Dentist appointment', date: 'May 26', notes: 'Regular checkup' },
  { id: '3', title: 'Birthday dinner', date: 'May 28', notes: 'Restaurant reservation' },
]

export const watchlist = [
  { id: '1', title: 'Dune: Part Two', type: 'Movie', genre: 'Sci-Fi', watched: false },
  { id: '2', title: 'Shogun', type: 'Series', genre: 'Drama', watched: false },
  { id: '3', title: 'Oppenheimer', type: 'Movie', genre: 'Drama', watched: true },
]

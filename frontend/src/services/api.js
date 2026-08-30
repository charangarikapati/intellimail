import axios from 'axios';
import { MOCK_EMAILS } from './mockData';

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// Attach Authorization header if session token exists
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('intellimail_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const api = {
  // Auth
  getAuthUrl: async () => {
    try {
      const res = await client.get('/auth/google/url');
      return res.data;
    } catch (e) {
      return { url: '/?demo=true', isDemo: true };
    }
  },

  getAuthMe: async () => {
    try {
      const res = await client.get('/auth/me');
      return res.data;
    } catch (e) {
      return null;
    }
  },

  disconnectAccount: async () => {
    try {
      const res = await client.post('/auth/disconnect');
      return res.data;
    } catch (e) {
      return { status: 'success' };
    }
  },

  // Emails
  getEmails: async (category = null) => {
    try {
      const res = await client.get('/emails', { params: { category } });
      return res.data;
    } catch (e) {
      if (category && category !== 'all') {
        return MOCK_EMAILS.filter(m => m.category.toLowerCase() === category.toLowerCase());
      }
      return MOCK_EMAILS;
    }
  },

  getEmail: async (id) => {
    try {
      const res = await client.get(`/emails/${id}`);
      return res.data;
    } catch (e) {
      return MOCK_EMAILS.find(m => m.id === id) || MOCK_EMAILS[0];
    }
  },

  toggleStar: async (id) => {
    try {
      const res = await client.post(`/emails/${id}/star`);
      return res.data;
    } catch (e) {
      const msg = MOCK_EMAILS.find(m => m.id === id);
      if (msg) msg.isStarred = !msg.isStarred;
      return { id, isStarred: msg ? msg.isStarred : true };
    }
  },

  toggleArchive: async (id) => {
    try {
      const res = await client.post(`/emails/${id}/archive`);
      return res.data;
    } catch (e) {
      const msg = MOCK_EMAILS.find(m => m.id === id);
      if (msg) msg.isArchived = !msg.isArchived;
      return { id, isArchived: msg ? msg.isArchived : true };
    }
  },

  deleteEmail: async (id) => {
    try {
      const res = await client.delete(`/emails/${id}`);
      return res.data;
    } catch (e) {
      const msg = MOCK_EMAILS.find(m => m.id === id);
      if (msg) msg.isDeleted = true;
      return { id, isDeleted: true };
    }
  },

  restoreEmail: async (id) => {
    try {
      const res = await client.post(`/emails/${id}/restore`);
      return res.data;
    } catch (e) {
      const msg = MOCK_EMAILS.find(m => m.id === id);
      if (msg) msg.isDeleted = false;
      return { id, isDeleted: false };
    }
  },

  searchEmails: async (query) => {
    try {
      const res = await client.get('/search', { params: { q: query } });
      return res.data;
    } catch (e) {
      const q = query.toLowerCase();
      return MOCK_EMAILS.filter(m => 
        m.subject.toLowerCase().includes(q) || 
        m.sender.toLowerCase().includes(q) || 
        m.body.toLowerCase().includes(q)
      );
    }
  },

  // AI Actions
  summarizeEmail: async (emailId, content) => {
    try {
      const res = await client.post('/ai/summarize', { emailId, content });
      return res.data;
    } catch (e) {
      const c = (content || '').toLowerCase();
      if (c.includes('techinnovators')) {
        return {
          emailId,
          summary: "TechInnovators invited you to a 45-minute technical interview for the Full-Stack AI Internship on Sept 4 at 10:00 AM IST.",
          keyPoints: ["Submit updated PDF resume, government ID proof, and GitHub links before September 1.", "Confirm availability for September 4 before Monday."],
          datesMentioned: ["September 4 at 10:00 AM IST", "September 1"]
        };
      } else if (c.includes('cs402')) {
        return {
          emailId,
          summary: "Prof. Varma announced the CS402 Assignment 3 submission deadline and mid-term exam date.",
          keyPoints: ["Assignment 3 (FastAPI & Database) due Friday, August 28 at 11:59 PM.", "Mid-Term Examination scheduled for September 10 at Exam Hall B."],
          datesMentioned: ["August 28 at 11:59 PM", "September 10"]
        };
      }
      return {
        emailId,
        summary: `Overview: ${content.substring(0, 140)}`,
        keyPoints: ["Review contents and respond as needed."],
        datesMentioned: ["As mentioned in email"]
      };
    }
  },

  generateReply: async (emailId, content, tone = 'Professional', userInstruction = '') => {
    try {
      const res = await client.post('/ai/generate-reply', { emailId, content, tone, userInstruction });
      return res.data;
    } catch (e) {
      const c = (content || '').toLowerCase();
      let contextText = "Thank you for reaching out. I have reviewed the details mentioned in your email and confirm receipt.";
      if (c.includes('techinnovators')) {
        contextText = "Thank you for scheduling the technical interview for the Full-Stack Developer Internship. I confirm my availability for Wednesday, September 4 at 10:00 AM IST and will submit my resume and ID proof prior to September 1.";
      } else if (c.includes('cs402')) {
        contextText = "Thank you Professor Varma. I have noted the Assignment 3 deadline for August 28 and the Mid-Term exam date on September 10.";
      }

      return {
        emailId,
        replyDraft: `Dear Sender,\n\n${contextText}\n\nPlease let me know if any additional information is required.\n\nBest regards,\nCharan`,
        tone
      };
    }
  },

  explainEmail: async (emailId, content) => {
    try {
      const res = await client.post('/ai/explain', { emailId, content });
      return res.data;
    } catch (e) {
      const c = (content || '').toLowerCase();
      let exp = `Plain English Explanation:\n${content.substring(0, 150)}...`;
      if (c.includes('techinnovators')) {
        exp = "Plain English Explanation:\nTechInnovators liked your resume and wants to interview you on September 4 at 10:00 AM. Before September 1, you must email them your resume, government ID, and GitHub links.";
      } else if (c.includes('cs402')) {
        exp = "Plain English Explanation:\nProf. Varma is warning the class that Assignment 3 is due this Friday (Aug 28) by 11:59 PM and late submissions lose 10% per day. Also, the mid-term exam is on September 10.";
      }
      return { emailId, explanation: exp };
    }
  },

  extractActions: async (emailId, content) => {
    try {
      const res = await client.post('/ai/extract-actions', { emailId, content });
      return res.data;
    } catch (e) {
      const c = (content || '').toLowerCase();
      let items = [];

      if (c.includes('techinnovators') || emailId === 'msg-101') {
        items = [
          { task: "Submit updated PDF Resume & Government ID Proof", deadline: "September 1", completed: false },
          { task: "Confirm availability for technical interview", deadline: "September 4 at 10:00 AM IST", completed: false },
          { task: "Send links to GitHub repositories", deadline: "September 1", completed: false }
        ];
      } else if (c.includes('cs402') || emailId === 'msg-102') {
        items = [
          { task: "Submit CS402 Assignment 3 (FastAPI & DB Integration) on portal", deadline: "Friday, August 28 at 11:59 PM", completed: false },
          { task: "Prepare for CS402 Mid-Term Examination at Exam Hall B", deadline: "September 10", completed: false }
        ];
      } else if (c.includes('bank') || emailId === 'msg-103') {
        items = [
          { task: "Download July e-statement PDF for account XXXX4210", deadline: "Monthly Review", completed: false },
          { task: "Unlock PDF attachment using 8-digit Date of Birth password", deadline: "Immediate", completed: false }
        ];
      } else if (c.includes('cloud') || emailId === 'msg-104') {
        items = [
          { task: "Review OAuth consent screen verification status in GCP console", deadline: "Before public release", completed: false },
          { task: "Audit monthly GCP billing & free tier quota usage", deadline: "Monthly", completed: false }
        ];
      } else {
        items = [
          { task: `Review communication details: ${content.substring(0, 60)}...`, deadline: "As requested", completed: false }
        ];
      }

      return { emailId, actionItems: items };
    }
  },

  getAIBriefing: async () => {
    try {
      const res = await client.get('/ai/overview');
      return res.data;
    } catch (e) {
      return {
        totalNew: 4,
        highPriority: 2,
        mediumPriority: 1,
        lowPriority: 1,
        todayItems: [
          { id: "1", title: "TechInnovators Internship Interview", date: "Sep 4 at 10:00 AM", priority: "High" },
          { id: "2", title: "CS402 Assignment Submission", date: "Aug 28 at 11:59 PM", priority: "High" }
        ],
        briefSummary: "Your inbox contains 2 high-priority communications requiring document submission and schedule confirmation."
      };
    }
  },

  sendEmail: async (to, subject, body, threadId = null) => {
    try {
      const res = await client.post('/compose/send', { to, subject, body, threadId });
      return res.data;
    } catch (e) {
      return {
        id: `msg-${Date.now()}`,
        threadId: threadId || `thread-${Date.now()}`,
        sender: "Charan (You) <user@gmail.com>",
        senderEmail: "user@gmail.com",
        recipient: to,
        subject,
        snippet: body.substring(0, 80) + "...",
        body,
        date: "Just now",
        isRead: true,
        isStarred: false,
        isArchived: false,
        isDeleted: false,
        category: "Important",
        priority: "High"
      };
    }
  },

  getQuickReplies: async (emailId, content) => {
    try {
      const res = await client.post('/ai/quick-replies', { emailId, content });
      return res.data;
    } catch (e) {
      const c = (content || '').toLowerCase();
      let options = [];
      if (c.includes('techinnovators') || emailId === 'msg-101') {
        options = [
          {
            id: 'opt-1',
            label: 'Confirm Availability',
            preview: 'Confirm for Wed, Sep 4 at 10:00 AM IST.',
            fullDraft: 'Dear Ananya,\n\nThank you for this opportunity. I am happy to confirm my availability for the technical interview on Wednesday, September 4 at 10:00 AM IST.\n\nI will submit my updated resume, ID proof, and GitHub links before September 1.\n\nBest regards,\nCharan',
            tone: 'Professional'
          },
          {
            id: 'opt-2',
            label: 'Request Reschedule',
            preview: 'Request alternate interview slot.',
            fullDraft: 'Dear Ananya,\n\nThank you for inviting me to interview. Due to a prior academic commitment, would it be possible to reschedule the interview to Thursday, September 5 at 2:00 PM IST?\n\nBest regards,\nCharan',
            tone: 'Professional'
          },
          {
            id: 'opt-3',
            label: 'Ask for Meeting Link',
            preview: 'Request Google Meet platform link & agenda.',
            fullDraft: 'Dear Ananya,\n\nThank you for scheduling the interview. Could you please share the Google Meet link and any specific preparation guidelines?\n\nBest regards,\nCharan',
            tone: 'Friendly'
          }
        ];
      } else {
        options = [
          {
            id: 'opt-1',
            label: 'Acknowledge Receipt',
            preview: 'Confirm receipt of information.',
            fullDraft: 'Dear Sender,\n\nThank you for reaching out. I have received your email and will review the details shortly.\n\nBest regards,\nCharan',
            tone: 'Professional'
          },
          {
            id: 'opt-2',
            label: 'Request Details',
            preview: 'Ask for additional clarifications.',
            fullDraft: 'Hi,\n\nThanks for the update. Could you please share more details regarding the next steps?\n\nBest regards,\nCharan',
            tone: 'Friendly'
          }
        ];
      }
      return { emailId, options };
    }
  },

  synthesizeThread: async (threadId, messages) => {
    try {
      const res = await client.post('/ai/thread-synthesize', { threadId, messages });
      return res.data;
    } catch (e) {
      return {
        threadId,
        overallSummary: `Thread containing ${messages.length} message(s) discussing requirements and next steps.`,
        keyDecisions: ["Confirmed primary schedule", "Submission deadline noted"],
        pendingQuestions: ["Awaiting final confirmation link"],
        timeline: messages.map((m, i) => ({
          speaker: (m.sender || 'Participant').split('<')[0].trim(),
          summary: `Message #${i+1}: ${m.snippet || m.body?.substring(0, 80)}`,
          sentiment: 'Positive'
        }))
      };
    }
  },

  polishDraft: async (content, action = 'polish', tone = 'Professional') => {
    try {
      const res = await client.post('/ai/polish-draft', { content, action, tone });
      return res.data;
    } catch (e) {
      const cleaned = content.trim();
      if (action === 'shorten') {
        return { original: content, polished: `Hi,\n\n${cleaned}\n\nThanks,\nCharan`, action };
      } else if (action === 'expand') {
        return { original: content, polished: `Dear Sender,\n\nThank you for following up with me. ${cleaned}\n\nPlease let me know if any supplementary details are required.\n\nBest regards,\nCharan`, action };
      } else if (action === 'formalize') {
        return { original: content, polished: `Dear Sir/Madam,\n\nI am writing to formally address your correspondence. ${cleaned}\n\nRespectfully,\nCharan`, action };
      } else if (action === 'friendly') {
        return { original: content, polished: `Hi there!\n\nHope you're having a great week! ${cleaned}\n\nWarmly,\nCharan`, action };
      }
      return { original: content, polished: `Dear Sender,\n\nThank you for your correspondence. ${cleaned}\n\nBest regards,\nCharan`, action };
    }
  },

  snoozeEmail: async (id, snoozeUntil) => {
    try {
      const res = await client.post(`/emails/${id}/snooze`, { snoozeUntil });
      return res.data;
    } catch (e) {
      const msg = MOCK_EMAILS.find(m => m.id === id);
      if (msg) {
        msg.isSnoozed = true;
        msg.snoozedUntil = snoozeUntil;
      }
      return { id, isSnoozed: true, snoozeUntil };
    }
  },

  unsnoozeEmail: async (id) => {
    try {
      const res = await client.post(`/emails/${id}/unsnooze`);
      return res.data;
    } catch (e) {
      const msg = MOCK_EMAILS.find(m => m.id === id);
      if (msg) {
        msg.isSnoozed = false;
        msg.snoozedUntil = null;
      }
      return { id, isSnoozed: false };
    }
  },

  scheduleEmail: async (to, subject, body, sendAt, threadId = null) => {
    try {
      const res = await client.post('/compose/schedule', { to, subject, body, sendAt, threadId });
      return res.data;
    } catch (e) {
      return {
        id: `msg-${Date.now()}`,
        threadId: threadId || `thread-${Date.now()}`,
        sender: "Charan (You) <user@gmail.com>",
        senderEmail: "user@gmail.com",
        recipient: to,
        subject,
        snippet: `[Scheduled: ${sendAt}] ` + body.substring(0, 80) + "...",
        body,
        date: `Scheduled for ${sendAt}`,
        isRead: true,
        isStarred: false,
        isArchived: false,
        isDeleted: false,
        isSnoozed: false,
        scheduledFor: sendAt,
        category: "Important",
        priority: "High"
      };
    }
  }
};

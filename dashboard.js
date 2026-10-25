import { getStats, getComplaints } from './api.js';
import { escapeHtml, priorityBadge, statusBadge, formatDate } from './app.js';

const demoComplaints = [
  { id: 'FF-101', title: 'Water leakage in hostel washroom', location: 'Hostel Block A', priority: 'Critical', status: 'Pending', category: 'Plumbing', created_at: '2026-10-25T09:30:00' },
  { id: 'FF-102', title: 'Exposed electrical wiring', location: 'Academic Block', priority: 'Critical', status: 'In Progress', category: 'Electrical', created_at: '2026-10-25T08:45:00' },
  { id: 'FF-103', title: 'Broken classroom fan', location: 'Lecture Hall 2', priority: 'High', status: 'Pending', category: 'Electrical', created_at: '2026-10-24T14:00:00' },
  { id: 'FF-104', title: 'Overflowing dustbin', location: 'Cafeteria', priority: 'Medium', status: 'Resolved', category: 'Cleanliness', created_at: '2026-10-24T11:20:00' },
  { id: 'FF-105', title: 'Damaged pathway tiles', location: 'Main Entrance', priority: 'High', status: 'In Progress', category: 'Infrastructure', created_at: '2026-10-23T10:00:00' }
];

export async function loadDashboard() {
  const page = document.getElementById('page-dashboard');

  page.innerHTML = `
    <h2 class="mb-24" style="font-size:22px;">📊 Campus Health Dashboard</h2>
    <div class="stats-grid" id="statsGrid"></div>
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📝 Recent Complaints</h3>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('complaints')">View All</button>
        </div>
        <div id="recentComplaints"></div>
      </div>
      <div>
        <div class="card mb-24">
          <h3 class="card-title mb-16">📊 Priority Distribution</h3>
          <div id="priorityChart"></div>
        </div>
        <div class="card mb-24">
          <h3 class="card-title mb-16">📁 Issue Categories</h3>
          <div id="categoryBreakdown"></div>
        </div>
        <div class="card">
          <h3 class="card-title mb-16">⚡ Quick Actions</h3>
          <div class="quick-actions">
            <button class="btn btn-primary btn-sm" onclick="navigateTo('submit')">📝 Submit Complaint</button>
            <button class="btn btn-danger btn-sm" onclick="navigateTo('complaints')">🚨 View Critical</button>
          </div>
        </div>
      </div>
    </div>
    <p style="margin-top:16px;color:#64748b;font-size:12px;">
      Demo preview — sample data for presentation; backend connection is separate.
    </p>
  `;

  let complaints = demoComplaints;
  let stats = null;

  try {
    const results = await Promise.all([getStats(), getComplaints({ per_page: 100 })]);
    stats = results[0];
    if (results[1]?.complaints?.length) {
      complaints = results[1].complaints;
    }
  } catch (e) {
    console.log('Showing demo preview.');
  }

  const count = p => complaints.filter(c => c.priority?.toLowerCase() === p.toLowerCase()).length;
  const pending = complaints.filter(c => c.status?.toLowerCase() === 'pending').length;

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card critical"><div class="stat-icon">📋</div><div class="stat-info"><div class="stat-number">${stats?.total ?? complaints.length}</div><div class="stat-label">Total Complaints</div></div></div>
    <div class="stat-card critical"><div class="stat-icon">🚨</div><div class="stat-info"><div class="stat-number">${stats?.critical ?? count('Critical')}</div><div class="stat-label">Critical Issues</div></div></div>
    <div class="stat-card high"><div class="stat-icon">⚠️</div><div class="stat-info"><div class="stat-number">${stats?.high ?? count('High')}</div><div class="stat-label">High Priority</div></div></div>
    <div class="stat-card pending"><div class="stat-icon">⏳</div><div class="stat-info"><div class="stat-number">${stats?.pending ?? pending}</div><div class="stat-label">Pending Issues</div></div></div>
  `;

  document.getElementById('recentComplaints').innerHTML = `
    <div class="table-wrapper">
      <table class="table-mobile-cards">
        <thead><tr><th>ID</th><th>Title</th><th>Location</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          ${complaints.slice(0, 5).map(c => `
            <tr>
              <td>${escapeHtml(String(c.id))}</td>
              <td>${escapeHtml(c.title || 'Campus issue')}</td>
              <td>${escapeHtml(c.location || 'Campus')}</td>
              <td>${priorityBadge(c.priority || 'Medium')}</td>
              <td>${statusBadge(c.status || 'Pending')}</td>
              <td>${formatDate(c.created_at || new Date().toISOString())}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const counts = Object.fromEntries(priorities.map(p => [p, count(p)]));
  const max = Math.max(1, ...Object.values(counts));

  document.getElementById('priorityChart').innerHTML = `
    <div class="priority-bar-chart">
      ${priorities.map(p => `
        <div class="priority-bar-row">
          <span class="priority-bar-label">${p}</span>
          <div class="priority-bar-track">
            <div class="priority-bar-fill ${p.toLowerCase()}" style="width:${counts[p] / max * 100}%"></div>
          </div>
          <span class="priority-bar-count">${counts[p]}</span>
        </div>
      `).join('')}
    </div>
  `;

  const categories = {};
  complaints.forEach(c => {
    const cat = c.category || 'Other';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  document.getElementById('categoryBreakdown').innerHTML = `
    <ul class="category-list">
      ${Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, n]) =>
        `<li><span>${escapeHtml(cat)}</span><span class="category-count">${n}</span></li>`
      ).join('')}
    </ul>
  `;
}

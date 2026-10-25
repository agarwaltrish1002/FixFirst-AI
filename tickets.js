/**
 * FixFirst AI — Tickets Page
 * ============================
 * Lists all maintenance tickets and allows viewing details.
 */

import { getTickets, getTicket } from './api.js';
import { escapeHtml, priorityBadge, statusBadge, formatDate, showToast, openModal } from './app.js';

export async function loadTickets() {
  const page = document.getElementById('page-tickets');

  page.innerHTML = `
    <h2 class="mb-24" style="font-size:22px;">🎫 Maintenance Tickets</h2>

    <div class="alert alert-info mb-24">
      <span class="alert-icon">ℹ️</span>
      <div>Tickets are generated from complaints. Go to a complaint detail and click "Generate Ticket" to create one.</div>
    </div>

    <div class="card">
      <div id="ticketsTable"><p style="color:var(--gray-500)">Loading...</p></div>
    </div>
  `;

  const result = await getTickets();
  const container = document.getElementById('ticketsTable');

  if (!result) {
    container.innerHTML = `<div class="alert alert-danger"><span class="alert-icon">❌</span> Could not load tickets. Is the backend running?</div>`;
    return;
  }

  if (result.tickets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎫</div>
        <div class="empty-state-title">No tickets yet</div>
        <p class="empty-state-text">Generate your first ticket from a complaint.</p>
        <button class="btn btn-primary btn-sm" onclick="navigateTo('complaints')">View Complaints</button>
      </div>
    `;
    return;
  }

  const rows = result.tickets.map(t => `
    <tr class="clickable" data-ticket-id="${escapeHtml(t.id)}">
      <td data-label="Ticket ID"><strong>${escapeHtml(t.id)}</strong></td>
      <td data-label="Complaint">${escapeHtml(t.complaint_id)}</td>
      <td data-label="Location">${escapeHtml(t.location)}</td>
      <td data-label="Summary" class="truncate" style="max-width:200px;">${escapeHtml(t.issue_summary)}</td>
      <td data-label="Priority">${priorityBadge(t.priority)}</td>
      <td data-label="Department">${escapeHtml(t.department)}</td>
      <td data-label="Status">${statusBadge(t.status)}</td>
      <td data-label="Date">${formatDate(t.created_at)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="table-mobile-cards">
        <thead>
          <tr>
            <th>Ticket ID</th><th>Complaint</th><th>Location</th><th>Summary</th><th>Priority</th><th>Dept</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  // Click handler for ticket rows
  container.querySelectorAll('tr[data-ticket-id]').forEach(row => {
    row.addEventListener('click', async () => {
      const ticketId = row.dataset.ticketId;
      const ticket = await getTicket(ticketId);
      if (ticket && window._showTicketModal) {
        window._showTicketModal(ticket);
      } else {
        showToast('Could not load ticket details.', 'error');
      }
    });
  });
}

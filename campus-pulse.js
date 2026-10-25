/**
 * Campus Pulse — turns maintenance reports into prevention signals.
 * Insights are descriptive signals from submitted reports, not predictions.
 */
import { getComplaints } from './api.js';
import { escapeHtml, priorityBadge, statusBadge, formatDate } from './app.js';

const norm = value => String(value || 'Unknown').trim();
const openIssue = c => !['Resolved', 'Closed'].includes(c.status);

export async function loadCampusPulse() {
  const page = document.getElementById('page-campus-pulse');
  page.innerHTML = `
    <div class="pulse-hero">
      <div>
        <div class="pulse-eyebrow">FROM REACTIVE FIXES TO PROACTIVE CARE</div>
        <h2>Campus Pulse <span>🧭</span></h2>
        <p>Spot repeating problems, find maintenance hotspots, and act before small issues become campus-wide headaches.</p>
      </div>
      <button class="btn btn-primary" id="pulseRefresh">↻ Refresh signals</button>
    </div>
    <div class="pulse-note">🛡️ <strong>How to read this:</strong> these are patterns in submitted reports, not a guarantee that an incident will happen. Verify on-site before taking action.</div>
    <div id="pulseContent"><div class="card">Reading campus signals…</div></div>
  `;
  document.getElementById('pulseRefresh').addEventListener('click', renderPulse);
  await renderPulse();
}

async function renderPulse() {
  const host = document.getElementById('pulseContent');
  if (!host) return;
  host.innerHTML = '<div class="card">Refreshing signals…</div>';
  const result = await getComplaints({ page: 1, per_page: 100, sort_by: 'date', order: 'desc' });
  if (!result || !Array.isArray(result.complaints)) {
    host.innerHTML = '<div class="card"><h3>Could not load campus signals</h3><p>Check that the FixFirst backend is running, then refresh.</p></div>';
    return;
  }
  const all = result.complaints;
  const active = all.filter(openIssue);
  const resolved = all.filter(c => c.status === 'Resolved');
  const byLocation = new Map();
  const byCategory = new Map();
  const byPriority = new Map();
  all.forEach(c => {
    const loc = norm(c.location);
    const cat = norm(c.category);
    byLocation.set(loc, [...(byLocation.get(loc) || []), c]);
    byCategory.set(cat, [...(byCategory.get(cat) || []), c]);
    byPriority.set(norm(c.priority), (byPriority.get(norm(c.priority)) || 0) + 1);
  });
  const hotspots = [...byLocation.entries()]
    .map(([name, items]) => ({ name, items, active: items.filter(openIssue).length,
      critical: items.filter(c => c.priority === 'Critical' && openIssue(c)).length }))
    .sort((a,b) => b.critical-a.critical || b.active-a.active || b.items.length-a.items.length)
    .slice(0,5);
  const patterns = [...byCategory.entries()]
    .map(([name,items]) => ({name, total:items.length, active:items.filter(openIssue).length}))
    .sort((a,b) => b.active-a.active || b.total-a.total).slice(0,5);
  const critical = active.filter(c => c.priority === 'Critical');
  const overdue = active.filter(c => {
    const d = new Date(c.created_at);
    return !Number.isNaN(d.getTime()) && (Date.now()-d.getTime()) > 7*86400000;
  });
  const repeatLocations = hotspots.filter(h => h.items.length >= 2);
  const signals = [];
  if (critical.length) signals.push({level:'urgent',icon:'🚨',title:`${critical.length} open critical ${critical.length===1?'issue':'issues'}`,body:'Verify these hazards first and confirm that the responsible team has acknowledged them.',action:'Review critical reports',page:'complaints'});
  if (repeatLocations.length) signals.push({level:'watch',icon:'📍',title:`${repeatLocations.length} repeat location${repeatLocations.length===1?'':'s'} detected`,body:`${repeatLocations[0].name} has ${repeatLocations[0].items.length} reports. Check whether a recurring root cause needs a permanent fix.`,action:'Inspect hotspots',page:'campus-pulse'});
  if (overdue.length) signals.push({level:'watch',icon:'⏳',title:`${overdue.length} open issue${overdue.length===1?'':'s'} older than 7 days`,body:'Review ownership and update residents on the next action or expected completion date.',action:'Review open issues',page:'complaints'});
  if (!signals.length) signals.push({level:'good',icon:'🌱',title:'No immediate red flags in the loaded reports',body:'Keep collecting reports and check these signals regularly. A quiet dashboard does not replace physical safety checks.',action:'Log an observation',page:'submit'});
  const maxLoc = Math.max(1,...hotspots.map(x=>x.items.length));
  const maxCat = Math.max(1,...patterns.map(x=>x.active));
  host.innerHTML = `
    <div class="pulse-metrics">
      <div class="pulse-metric"><span>📥</span><small>Reports analysed</small><strong>${all.length}</strong><em>Latest ${all.length} records</em></div>
      <div class="pulse-metric"><span>🔧</span><small>Still need attention</small><strong>${active.length}</strong><em>${all.length ? Math.round(active.length/all.length*100) : 0}% of loaded reports</em></div>
      <div class="pulse-metric"><span>🚨</span><small>Critical and open</small><strong>${critical.length}</strong><em>Verify immediately</em></div>
      <div class="pulse-metric"><span>🌿</span><small>Resolved</small><strong>${resolved.length}</strong><em>Confirmed resolved reports</em></div>
    </div>
    <div class="pulse-grid">
      <section class="card">
        <div class="pulse-section-head"><div><span class="pulse-kicker">WHERE TO LOOK</span><h3>Maintenance hotspots</h3></div><span class="pulse-icon">📍</span></div>
        <p class="pulse-muted">Locations with the most reports in the loaded dataset.</p>
        ${hotspots.length ? hotspots.map(h=>`<div class="pulse-bar-row"><div class="pulse-bar-label"><strong>${escapeHtml(h.name)}</strong><span>${h.items.length} report${h.items.length===1?'':'s'} · ${h.active} open</span></div><div class="pulse-track"><div class="pulse-fill" style="width:${Math.max(6,h.items.length/maxLoc*100)}%"></div></div>${h.critical?`<small class="pulse-danger">${h.critical} critical</small>`:''}</div>`).join('') : '<p>No location data yet.</p>'}
      </section>
      <section class="card">
        <div class="pulse-section-head"><div><span class="pulse-kicker">WHAT KEEPS COMING BACK</span><h3>Issue patterns</h3></div><span class="pulse-icon">🔁</span></div>
        <p class="pulse-muted">Categories with the most unresolved reports.</p>
        ${patterns.length ? patterns.map(c=>`<div class="pulse-bar-row"><div class="pulse-bar-label"><strong>${escapeHtml(c.name)}</strong><span>${c.active} open · ${c.total} total</span></div><div class="pulse-track"><div class="pulse-fill pulse-fill-alt" style="width:${Math.max(6,c.active/maxCat*100)}%"></div></div></div>`).join('') : '<p>No category data yet.</p>'}
      </section>
    </div>
    <section class="card pulse-action-card">
      <div class="pulse-section-head"><div><span class="pulse-kicker">TURN SIGNALS INTO ACTION</span><h3>Prevention playbook</h3></div><span class="pulse-icon">⚡</span></div>
      <div class="pulse-signal-list">${signals.map(s=>`<article class="pulse-signal ${s.level}"><span class="pulse-signal-icon">${s.icon}</span><div class="pulse-signal-copy"><strong>${escapeHtml(s.title)}</strong><p>${escapeHtml(s.body)}</p></div><button class="btn btn-sm btn-secondary" data-pulse-page="${s.page}">${escapeHtml(s.action)} →</button></article>`).join('')}</div>
      <div class="pulse-playbook">
        <h4>Suggested weekly routine</h4>
        <div><b>01</b><span><strong>Inspect</strong><small>Visit repeat locations and verify the issue on-site.</small></span></div>
        <div><b>02</b><span><strong>Prevent</strong><small>Fix root causes, not only the latest symptom.</small></span></div>
        <div><b>03</b><span><strong>Close the loop</strong><small>Record the fix and tell the people who reported it.</small></span></div>
      </div>
    </section>
    <p class="pulse-footnote">Coverage note: insights use up to 100 most recent reports returned by the current API. They are descriptive, not predictive, and may change as reports are added.</p>
  `;
  host.querySelectorAll('[data-pulse-page]').forEach(btn => btn.addEventListener('click',()=>window.navigateTo(btn.dataset.pulsePage)));
}

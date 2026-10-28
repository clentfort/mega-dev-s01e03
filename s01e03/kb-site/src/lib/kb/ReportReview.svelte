<script lang="ts">
  import { onMount } from 'svelte';
  import ScrollRegion from '#lib/kb/ScrollRegion.svelte';
  import {
    draftGroups, reports, rawRows, duplicateRows, movedReports,
    receivedDays, tenantName,
  } from '#lib/kb/review';
  let ready = $state(false);

  onMount(() => {
    const openLinkedEvidence = () => {
      const detail = document.getElementById(window.location.hash.slice(1));
      if (detail instanceof HTMLDetailsElement) detail.open = true;
    };
    openLinkedEvidence();
    ready = true;
    window.addEventListener('hashchange', openLinkedEvidence);
    return () => window.removeEventListener('hashchange', openLinkedEvidence);
  });
</script>

<p class="summary" data-review-ready={ready}>
  <strong data-stat="unique" data-value={reports.length}>{reports.length} unique reports</strong>
  in <strong data-stat="drafts" data-value={draftGroups.length}>{draftGroups.length} tickets</strong>.
  Each report is counted once.
</p>
<p class="context">
  Received {receivedDays[0]} to {receivedDays.at(-1)}.
  The export has <span data-stat="raw" data-value={rawRows}>{rawRows} rows</span>;
  <span data-stat="duplicates" data-value={duplicateRows}>{duplicateRows} repeated rows</span> are not extra reports.
</p>

<ScrollRegion label="Proposed ticket split">
  <table>
    <thead><tr><th>Problem</th><th>Reports</th><th>Evidence status</th></tr></thead>
    <tbody>
      {#each draftGroups as group (group.id)}
        <tr data-problem={group.id} data-count={group.reports.length}>
          <td><a href={'#problem-' + group.id} onclick={() => {
            const detail = document.getElementById('problem-' + group.id);
            if (detail instanceof HTMLDetailsElement) detail.open = true;
          }}>{group.title}</a></td>
          <td class="count">{group.reports.length}</td>
          <td>{group.investigation ? 'Investigation' : 'Mechanism described by KB'}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot><tr><th>Total</th><td class="count">{reports.length}</td><td>No overlapping report IDs</td></tr></tfoot>
  </table>
</ScrollRegion>

<p class="context">
  <strong>{movedReports.length} reports</strong> have been moved out of the automatic parser group
  for investigation. The original classification is preserved below.
  These assignments are a review proposal, not independently reproduced product behavior.
</p>

<h3>Evidence behind each ticket</h3>
{#each draftGroups as group (group.id)}
  <details id={'problem-' + group.id} class="problem">
    <summary>{group.title} <span>({group.reports.length})</span></summary>
    <div class="detail-body">
      <p>{group.explanation}</p>
      {#if group.investigation}
        <p class="uncertain">Root cause unknown. This grouping may change as evidence arrives.</p>
      {/if}
      {#each group.examples as report (report.id)}
        <figure>
          <blockquote><p>{report.body}</p></blockquote>
          <figcaption>{report.id} · {tenantName(report)} · {report.channel} · received {report.receivedAt.slice(0, 10)}</figcaption>
        </figure>
      {/each}
      {#if group.draft}
        <p>
          <a href={'https://github.com/clentfort/mega-dev/issues/' + group.issueNumber}>Open the GitHub issue</a>
          · <a href={'/drafts/' + group.draft}>Read the issue text</a>
        </p>
      {/if}
      <details class="report-ids">
        <summary>Assigned report IDs</summary>
        <p>{group.reports.map((r) => r.id).join(', ')}</p>
      </details>
    </div>
  </details>
{/each}

<style>
  .summary { font-size: 1.15rem; margin-bottom: 0.4rem; }
  .context { color: var(--muted); font-size: 0.92rem; }
  th, td { text-align: left; vertical-align: top; }
  .count { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tfoot { font-weight: 600; }
  .problem { border-top: 1px solid var(--line); padding: 0.8rem 0; scroll-margin-top: 1rem; }
  summary { cursor: pointer; font-weight: 600; line-height: 1.5; }
  summary span { color: var(--muted); font-weight: 400; }
  .detail-body { padding: 0.25rem 0 0 1.2rem; }
  .uncertain { color: var(--warn); }
  figure { margin: 1rem 0; }
  blockquote { margin: 0; padding: 0.1rem 1rem; border-left: 3px solid var(--line); }
  figcaption { margin-top: 0.3rem; color: var(--muted); font-size: 0.85rem; }
  .report-ids { font-size: 0.85rem; }
  .report-ids p { overflow-wrap: anywhere; }
  :is(a, summary):focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
  @media (max-width: 520px) {
    th, td { padding: 0.4rem 0.3rem; }
    .detail-body { padding-left: 0.4rem; }
  }
</style>

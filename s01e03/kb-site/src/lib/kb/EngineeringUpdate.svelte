<script lang="ts">
  import update from '#lib/data/engineering-update.json';
</script>

<aside class="update" aria-label="Engineering update">
  <h2>Engineering update</h2>
  <p><strong>#{update.ticket} closed {update.closedAt}.</strong> This update is newer than the report export.</p>
  <ul>
    {#each Object.entries(update.outcomes) as [cause, outcome] (cause)}
      <li><strong>{cause}: {outcome.status}.</strong> {outcome.detail}.
        <a href={'https://github.com/clentfort/mega-dev/issues/' + outcome.issueNumber}>Issue #{outcome.issueNumber}</a>
      </li>
    {/each}
  </ul>
  <p>The separate investigations remain unresolved; this update does not establish their causes.</p>
  <p class="source"><a href={update.source}>Course engineering update</a>, checked {update.retrievedAt}.</p>
</aside>

<style>
  .update { margin: 1.5rem 0; padding: 1rem; background: var(--note-bg); border-left: 4px solid var(--accent); }
  h2 { margin-top: 0; font-size: 1.3rem; }
  p:last-child { margin-bottom: 0; }
  .source { font-size: 0.85rem; color: var(--muted); }
</style>

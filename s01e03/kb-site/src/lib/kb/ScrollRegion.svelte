<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, children }: { label: string; children: Snippet } = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Overflowing tables require keyboard scrolling.) -->
<div role="region" aria-label={label} tabindex="0">
  {@render children()}
</div>

<style>
  div { overflow-x: auto; }
  div:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
</style>

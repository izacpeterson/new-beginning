<!-- +error.svelte -->
<script>
  export let status;
  export let error;
</script>

<h1>{status}</h1>
<p>{error?.message ?? "An unknown error occurred."}</p>

<!-- +error.svelte -->
<script>
  export let status;
  export let error;
</script>

<div class="fixed top-0 left-0 bg-black text-white w-screen h-screen z-50 flex items-center justify-center">
  <h1>{status}</h1>
  <p>{error?.message ?? "An unknown error occurred."}</p>
</div>

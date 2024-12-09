<script>
  import "../app.css";
  let { children } = $props();

  let email = $state("");
  let key = $state("");

  let loggedIn = $state(true);
</script>

{#if loggedIn}
  <div class="navbar bg-base-100">
    <a href="/" class="btn btn-ghost text-xl">Internal Systems</a>
  </div>

  {@render children()}
{:else}
  <div class="flex flex-col items-center">
    <div>login</div>
    <input bind:value={email} type="text" class="input input-primary" />
    <input bind:value={key} type="text" class="input input-primary" />
    <button onclick={async () => {}} class="btn btn-primary">Login</button>
  </div>
{/if}

<script>
  import "../app.css";
  let { children } = $props();

  let email = $state("");
  let key = $state("");

  let loggedIn = $state(true);
</script>

{#if loggedIn}
  <div class="navbar bg-primary text-primary-content">
    <div class="flex-1">
      <a href="/" class="btn btn-primary text-xl">Internal Systems</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/crons">Crons</a></li>
        <li><a href="/logs">Logs</a></li>
        <li><a href="/settings">Settings</a></li>

        <!-- <li>
          <details>
            <summary>Parent</summary>
            <ul class="bg-base-100 rounded-t-none p-2">
              <li><a>Link 1</a></li>
              <li><a>Link 2</a></li>
            </ul>
          </details>
        </li> -->
      </ul>
    </div>
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

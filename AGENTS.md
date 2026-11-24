<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Storefront conventions

- Keep mock catalog and cart domain data separate from image presentation maps, so theme changes do not change products, prices, or cart behavior.
- Define storefront colors, surfaces, and shadows in `src/styles.css` and use semantic classes with shared UI controls, so all buyer pages stay theme-consistent.
- Reuse uploaded brand pixels and crop generated catalog photography into individual product images; never replace supplied branding with generated imitations.
- Compose the storefront lead from a full-width photographic cover, unnumbered photographic categories, and an asymmetrical catalog-linked product section, so presentation remains separate from catalog logic.
- Keep seller and Webmaster views under separate Outlet layouts and shared portal controls, so segment navigation remains distinct from buyer pages.
- Use a root-scoped in-memory prototype provider for sample seller, review, and onboarding interactions; never persist or imply real authentication or payments in this mock prototype.
- Leave shipping and final cart totals unquoted until destination, parcel weight, and courier are available, so the presentation does not invent a shipping policy.
